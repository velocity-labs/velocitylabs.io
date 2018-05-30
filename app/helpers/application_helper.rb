module ApplicationHelper
  def copyright
    years = [2014, Date.today.year].uniq.join('&ndash;')
    "Copyright &copy; #{years} Velocity Labs, LLC".html_safe
  end

  def meta_description

  end

  def site_title(title)
    [title, 'Velocity Labs'].join(' | ')
  end
end
