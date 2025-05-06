import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { 
  ChakraProvider, 
  defineConfig, 
  createSystem, 
  defaultConfig,
  defineRecipe
} from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Define Button recipe separately - with proper variant syntax
const buttonRecipe = defineRecipe({
  base: {
    fontWeight: "600",
    borderRadius: "md",
  },
  variants: {
    variant: {
      solid: {
        bg: "brand.500",
        color: "white",
        _hover: {
          bg: "brand.600",
          _disabled: {
            bg: "brand.500",
          },
        },
      },
    },
  },
});

// Create a custom theme configuration
const config = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: "#e6f1ff" },
          100: { value: "#b8d5ff" },
          200: { value: "#8ab9ff" },
          300: { value: "#5c9dff" },
          400: { value: "#2e81ff" },
          500: { value: "#1467e6" }, // primary brand color
          600: { value: "#0d50b3" },
          700: { value: "#073a80" },
          800: { value: "#02234d" },
          900: { value: "#000d1a" },
        },
      },
      fonts: {
        heading: { value: "'Poppins', sans-serif" },
        body: { value: "'Inter', sans-serif" },
      },
    },
    recipes: {
      Button: buttonRecipe,
    },
  },
});

// Create the styling system
const system = createSystem(defaultConfig, config);


// Render the app
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ChakraProvider value={system}>
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);