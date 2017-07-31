```bash
npm i

cat > .env << EOL
CONTENTFUL_SPACE=
CONTENTFUL_ACCESS_TOKEN=
EOL

npm run dev
```

### Simulating a request using curl

```bash
# without credentials
$ curl -X POST --header "X-Contentful-Topic: ContentManagement.Entry.publish" localhost:5000
# with authentication
$ curl -X POST -u username:password --header "X-Contentful-Topic: ContentManagement.Entry.publish" localhost:5000
```
