import "dotenv/config"
import app from "./app"

const PORT = process.env.PORT || 4000

app.listen(PORT, () => {
  const host = process.env.HOST || 'localhost';
  const protocol = process.env.PROTOCOL || 'http';
  console.log(`🚀 Server running at ${protocol}://${host}:${PORT}`);
})
