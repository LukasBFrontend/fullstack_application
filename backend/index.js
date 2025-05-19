const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api', (req, res) => {
  res.send({hello: 'World'});
})

app.use(express.static(path.join(path.resolve(), 'dist')));

app.listen(PORT, () => {
  console.log(`Server ready at http://localhost:${PORT}`);
});
