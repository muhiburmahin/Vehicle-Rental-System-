import config from "./config";
const port = config.port;
import app from "./app";

app.listen(port, () => {
    console.log(`Server is running at: http://localhost:${port}`);
})















// import config from "./config";
// const port = config.port;
// import app from "./app";


// app.listen(port, () => {
//     console.log(`Server running on port ${port}.`);
//     console.log(`API is running on : http://localhost:${port}`);
// });
