Rails.application.routes.draw do
  get '/.well-known/acme-challenge/:id' => 'lets_encrypt#show'
  get 'sitemap.xml' => 'sitemaps#show'

  get '/contact-us' => 'leads#new', as: :new_contact

  root to: 'high_voltage/pages#show', id: 'home'
end
