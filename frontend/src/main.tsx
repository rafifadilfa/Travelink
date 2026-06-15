import * as React from "react";
import * as ReactDOM from "react-dom/client";
import {
  ChakraProvider,
  extendTheme, 
} from "@chakra-ui/react";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";

// Define your custom theme using extendTheme
const customTheme = extendTheme({
  colors: {
    brand: {
      50: "#e6f1ff",
      100: "#b8d5ff",
      200: "#8ab9ff",
      300: "#5c9dff",
      400: "#2e81ff",
      500: "#1467e6", // primary brand color
      600: "#0d50b3",
      700: "#073a80",
      800: "#02234d",
      900: "#000d1a",
    },
  },
  fonts: {
    heading: "'Poppins', sans-serif",
    body: "'Inter', sans-serif",
  },
  components: {
    Button: {
      // Base styles for all buttons
      baseStyle: {
        fontWeight: "600", // Corresponds to your "black" in Poppins if available, otherwise bold
        borderRadius: "md",
        // You can add other base styles here, e.g., transition
        transitionProperty: "common",
        transitionDuration: "normal",
      },
      // Variants
      variants: {
        solid: (props: any) => {
          if (props.colorScheme && props.colorScheme !== 'brand') return {};
          return {
            bg: "brand.500",
            color: "white",
            _hover: {
              bg: "brand.600",
              _disabled: { bg: "brand.500", opacity: 0.6 },
            },
            _active: { bg: "brand.700" },
            _disabled: { bg: "brand.300", opacity: 0.6, cursor: "not-allowed" },
          };
        },
        outline: (props: any) => {
          if (props.colorScheme && props.colorScheme !== 'brand') return {};
          return {
            borderColor: "brand.500",
            color: "brand.500",
            _hover: { bg: "brand.50", borderColor: "brand.600" },
            _active: { bg: "brand.100" },
            _disabled: { borderColor: "brand.300", color: "brand.300", opacity: 0.6, cursor: "not-allowed" },
          };
        },
      },
     
    },
  
  },
 
});

// Render the app
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
     
      <ChakraProvider theme={customTheme}>
        <App />
      </ChakraProvider>
    </BrowserRouter>
  </React.StrictMode>
);