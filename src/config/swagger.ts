
import swaggerJsdoc from "swagger-jsdoc";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Makery API",
      version: "1.0.0",
      description:
        "Dokumentasi REST API Makery - Marketplace Produk Handmade"
    },
    servers: [
      {
        url: "http://localhost:8000/api",
        description: "Local Development Server"
      }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Masukkan token JWT hasil login"
        }
      }
    }
  },
  apis: ["./src/routes/*.ts"]
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
