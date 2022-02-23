# node-pdftk-serverless
<p>
  <img src="https://user-images.githubusercontent.com/4951716/155342378-324f73a2-553d-466e-b900-edbb4d8b3ba3.png" width="90" height="90" alt="pdftk logo"> 
  <img src="https://user-images.githubusercontent.com/4951716/155342700-2ac197e3-1b6c-4bed-8ab8-94f9a656e117.png" width="90" height="90" alt="serverless logo">
</p>

[node-pdftk](https://github.com/jjwilly16/node-pdftk) + [serverless](https://github.com/serverless/serverless) Real world example

## Installation
```sh
yarn
```
```sh
npm install -g serverless
```

## Testing
You can easily test in local environment thanks to [serverless-offline](https://www.npmjs.com/package/serverless-offline) plugin.

### Start local server
```sh
sls offline
```
It starts local server on http://localhost:3000. There are two endpoints `/stamp`, and `/merge`.

### Send POST to `http://localhost:3000/stamp` to test `stamp` PDF
<p>
  <img width="579" alt="stamp_example" src="https://user-images.githubusercontent.com/4951716/155346894-f200ae6a-892c-4a77-939f-fe8777b2d3ff.png">
  <em>Postman body example</em>
</p>

Note that you should use `input`, `stamp` for key name.

It stamps `stamp` PDF on `input` PDF, but only first page. You can change the function in `stamp.js`.

It returns PDF blob with `application/pdf` header so you can check out the preview in response body in Postman.

### Send POST to `http://localhost:3000/merge` to test `merge` PDF
<p>
  <img width="571" alt="merge_example" src="https://user-images.githubusercontent.com/4951716/155346915-9b6fa1cf-b529-4c16-b1d0-6472b3ad9da1.png">
  <em>Postman body example</em>
</p>

It merges all incoming PDF regardless of key name.

It returns PDF blob with `application/pdf` header so you can check out the preview in response body in Postman.

## Deployment
### Configure `serverless.yml`

```yml
provider:
  name: aws
  runtime: nodejs12.x
  stage: production
  region: ap-northeast-2
```
Update the `region`, `stage`, etc to meet your needs.

```yml
    layers:
      - arn:aws:lambda:ap-northeast-2:545918303703:layer:pdftkLayer:3
```
You can use my prebuilt lambda layer (pdftk `v2.02`) or use your own layer.

### Serverless Deploy
```sh
sls deploy --stage=production
```

### LICENSE
[MIT](https://github.com/iicdii/node-pdftk-serverless/blob/main/LICENSE)
