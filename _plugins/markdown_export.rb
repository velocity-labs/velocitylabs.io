require 'reverse_markdown'

# Publishes a Markdown copy of each indexable page for AI tools (see
# llmstxt.org): /blog/2018/06/20/slug/ -> /blog/2018/06/20/slug.md and
# / -> /index.md. Also writes /llms-full.txt with every page in one file.
#
# Copies are converted from the rendered HTML, so Liquid tags, includes and
# syntax highlighting are already resolved. Only the main content is kept.
module VelocityLabs
  module MarkdownExport
    # Main content element for each exported layout, in llms-full.txt order
    CONTENT_SELECTORS = {
      'home'    => '#main',
      'landing' => '#main',
      'page'    => '#main',
      'post'    => '.post-body'
    }.freeze

    # Navigation, the contact form, buttons and decoration (star fields,
    # orbits, the honeypot) add nothing as text
    NOISE = 'nav, #contact, form, script, style, noscript, button, .btn, .cta-band, ' \
            'svg, [aria-hidden="true"], .hp, .form-status'.freeze

    module_function

    def exportable?(page)
      page.output_ext == '.html' && CONTENT_SELECTORS.key?(page.data['layout']) &&
        !page.data['noindex'] && page.data['sitemap'] != false
    end

    def markdown_url(page)
      page.url == '/' ? '/index.md' : "#{page.url.chomp('/')}.md"
    end

    def write(site)
      pages = site.pages.select { |page| page.data['markdown_url'] }
      posts = site.posts.docs.select { |post| post.data['markdown_url'] }.reverse
      layout_order = CONTENT_SELECTORS.keys

      documents = (pages.sort_by { |page| [layout_order.index(page.data['layout']), page.url] } + posts).map do |page|
        markdown = document(page, site)
        path = File.join(site.dest, page.data['markdown_url'])
        FileUtils.mkdir_p(File.dirname(path))
        File.write(path, markdown)
        markdown
      end

      header = "# #{site.config['title']}: Full Site Content\n\n> #{site.config['description']}\n\n"
      File.write(File.join(site.dest, 'llms-full.txt'), header + documents.join("\n\n---\n\n"))
    end

    def document(page, site)
      lines = ["# #{plain(page.data['title']) || site.config['title']}", '']

      description = plain(page.data['description'] || page.data['excerpt']) ||
                    (page.url == '/' && site.config['description'])
      lines.push("> #{description}", '') if description

      lines << "- URL: #{site.config['url']}#{page.url}"
      if page.is_a?(Jekyll::Document)
        lines << "- Published: #{page.date.strftime('%B %-d, %Y')}"
        author = page.data['author']
        lines << "- Author: #{author['name']}" if author.is_a?(Hash)
      end

      [*lines, '', body(page, site)].join("\n").strip + "\n"
    end

    def body(page, site)
      doc = Nokogiri::HTML(page.output)
      selector = CONTENT_SELECTORS[page.data['layout']]
      # a layout that loses its content element would silently export empty copies
      root = doc.at_css(selector) or raise "markdown_export: #{page.url} has no #{selector} element"
      root.css(NOISE).remove
      root.xpath('.//comment()').remove
      remove_decorative_images(root)
      absolutize(root, "#{site.config['url']}#{page.url}", site.config['url'])
      move_link_whitespace_outside(root)
      root.css('iframe').each { |frame| frame.replace(iframe_link(doc, frame)) }
      code_blocks = extract_code_blocks(doc, root)

      markdown = ReverseMarkdown.convert(root.inner_html, unknown_tags: :bypass, github_flavored: true)
      code_blocks.each_with_index { |code, i| markdown.sub!("VLCODEBLOCK#{i}X", code) }
      markdown.gsub(/[ \t]+$/, '')
              .gsub(/\*\* ([,.;:])/, '**\1')            # "**bold** , text"
              .gsub(/([?.!:])\*\*(?=[A-Za-z])/, '\1** ') # "**Question?**Answer"
              .gsub(/\n{3,}/, "\n\n").strip
    end

    # Avatars and thumbnail links to full-size images add nothing as text
    def remove_decorative_images(root)
      root.css('img[src*="gravatar.com"]').remove
      root.css('a').each do |link|
        link.remove if link.text.strip.empty? && link.at_css('img') && link['href'].to_s.match?(/\.(png|jpe?g|gif|webp)\z/i)
      end
    end

    def absolutize(root, page_url, base)
      { 'a' => 'href', 'img' => 'src' }.each do |tag, attr|
        root.css("#{tag}[#{attr}]").each do |node|
          value = node[attr]
          node[attr] = if value.start_with?('//') then "https:#{value}"
                       elsif value.start_with?('/') then "#{base}#{value}"
                       elsif value.start_with?('#') then "#{page_url}#{value}"
                       else value
                       end
        end
      end
    end

    # Browsers render "<a> Array </a>and" with a space before "and", but the
    # converter trims whitespace inside links, so move it outside.
    def move_link_whitespace_outside(root)
      root.css('a').each do |link|
        before, after = link.previous_sibling, link.next_sibling
        if link.children.first&.text? && link.children.first.content.match?(/\A\s/) && !(before&.text? && before.content.match?(/\s\z/))
          link.add_previous_sibling(' ')
        end
        if link.children.last&.text? && link.children.last.content.match?(/\s\z/) && !(after&.text? && after.content.match?(/\A[\s,.;:!?)]/))
          link.add_next_sibling(' ')
        end
      end
    end

    def iframe_link(doc, frame)
      src = frame['src'].to_s.sub(%r{\A(https?:)?//}, 'https://')
      video_id = src[%r{youtube\.com/embed/([\w-]+)}, 1]
      src = "https://www.youtube.com/watch?v=#{video_id}" if video_id
      paragraph = doc.create_element('p')
      paragraph.add_child(doc.create_element('a', frame['title'] || (video_id ? 'Video' : 'Embedded content'), href: src))
      paragraph
    end

    # Highlighted code turns into a mess of spans; swap each block for a
    # placeholder and restore it as a fenced block after conversion.
    def extract_code_blocks(doc, root)
      blocks = root.css('pre').reject { |pre| pre.ancestors('pre').any? }
      blocks.map.with_index do |pre, i|
        wrapper = pre
        wrapper = wrapper.parent while wrapper.parent != root &&
                                       (wrapper.parent.name == 'figure' || wrapper.parent['class'].to_s.include?('highlight'))
        classes = [pre, *pre.css('code'), *pre.ancestors.take(3)].map { |node| node['class'].to_s }.join(' ')
        language = classes[/language-(\S+)/, 1].to_s.sub(/\A(text|plaintext)\z/, '')
        # Line-numbered blocks render a table with the numbers in a gutter column
        code = (pre.at_css('td.code pre') || pre).text.chomp
        fence = code.include?('```') ? '~~~~' : '```'

        placeholder = doc.create_element('p')
        placeholder.content = "VLCODEBLOCK#{i}X"
        wrapper.replace(placeholder)
        "#{fence}#{language}\n#{code}\n#{fence}"
      end
    end

    def plain(value)
      return nil if value.nil?

      text = Nokogiri::HTML.fragment(value.to_s).text.gsub(/\s+/, ' ').strip
      text.empty? ? nil : text
    end
  end
end

Jekyll::Hooks.register(:site, :pre_render) do |site|
  (site.pages + site.posts.docs).each do |page|
    page.data['markdown_url'] = VelocityLabs::MarkdownExport.markdown_url(page) if VelocityLabs::MarkdownExport.exportable?(page)
  end
end

Jekyll::Hooks.register(:site, :post_write) { |site| VelocityLabs::MarkdownExport.write(site) }
