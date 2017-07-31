```bash
$ npm i

$ cat > .env << EOL
CONTENTFUL_SPACE=
CONTENTFUL_ACCESS_TOKEN=
CONTENTFUL_WEBHOOK_USERNAME=
CONTENTFUL_WEBHOOK_PASSWORD=
EOL

$ npm run dev
# Simiulate request without credentials
$ curl -X POST --header \
  "X-Contentful-Topic: ContentManagement.Entry.publish" \
  localhost:5000
# with authentication
$ curl -X POST -u username:password \
  --header "X-Contentful-Topic: ContentManagement.Entry.publish" \
  localhost:5000
```
