const app = require('express');
const app = express();

const PORT = process.env.port || 80;

app.use(express.json());
app.use(cors());

app.listen(PORT, () => console.log('server started on PORT ' + PORT))

app.get('/', (req, res) => {
    res.end('<h1>Home page</h1>');
});

app.get('/about', (req, res) => {
    res.end('<h1>About page</h1>');
});