---
contact: true
excerpt: Check out the web applications the Velocity Labs team has developed for our clients. We use a variety of languages and frameworks to create great experiences.
layout: inner
title: Projects
---

<section class="separator" id="projects">
  <div class="page-header text-center">
    <h2>Projects we've worked on</h2>
  </div>

  <div id="filters" class="button-group text-center">
    <button data-filter-value="*" class="active">show all</button>
    {% assign categories = site.data.projects | get_categories %}
    {% for category in categories %}
      <button data-filter-value=".{{ category }}">{{ category }}</button>
    {% endfor %}
  </div>

  <div class="demo-3">
    <div id="portfolio" class="grid js-isotope" data-isotope-options='{ "columnWidth": 350, "itemSelector": ".portfolio-item" }'>
      {% for project in site.data.projects %}
        <div class="col-xs-12 col-sm-6 col-md-3 portfolio-item {{ project.categories | join: ' ' | downcase }}">
          {% assign full_path=project.title | full_image_path %}
          {% assign thumb_path=project.title | thumb_image_path %}

          <a href="/images/{{ full_path }}" rel="nofollow" class="popup-gallery popovers" title="{{ project.title }}" data-html="true" data-content="{{ project.description | xml_escape }}<br /&gt;<b&gt;Type: {{ project.categories | array_to_sentence_string }}</b&gt;">
            <img src="/images/{{ thumb_path }}" alt="{{ project.title }}" class="img-responsive center-block">
          </a>
          <div class="visible-xs">
            <h3>{{ project.title }}</h3>
            <p>{{ project.description }}</p>
            <b>Type: {{ project.categories | array_to_sentence_string }}</b>
          </div>
        </div>
      {% endfor %}
    </div>
  </div>
</section>
