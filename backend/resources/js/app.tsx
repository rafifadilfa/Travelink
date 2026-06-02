import '../css/app.css';
import './bootstrap.js';
import '../css/index.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { initializeTheme } from './hooks/use-appearance';
import { ChakraProvider, extendTheme } from '@chakra-ui/react'; // <-- 1. Import the provider


const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

const customTheme = extendTheme({
  colors: {
    brand: {
      50: "#e6f1ff",
      100: "#b8d5ff",
      200: "#8ab9ff",
      300: "#5c9dff",
      400: "#2e81ff",
      500: "#1467e6",
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
      baseStyle: {
        fontWeight: "600",
        borderRadius: "md",
        transitionProperty: "common",
        transitionDuration: "normal",
      },

      variants: {
        solid: () => ({ 
          bg: "brand.500",
          color: "white",
          _hover: {
            bg: "brand.600",
            _disabled: {
              bg: "brand.500",
              opacity: 0.6,
            },
          },
          _active: {
            bg: "brand.700",
          },
          _disabled: {
            bg: "brand.300",
            opacity: 0.6,
            cursor: "not-allowed",
          }
        }),

        outline: () => ({
          borderColor: "brand.500",
          color: "brand.500",
          _hover: {
            bg: "brand.50",
            borderColor: "brand.600",
          },
          _active: {
            bg: "brand.100",
          },
          _disabled: {
            borderColor: "brand.300",
            color: "brand.300",
            opacity: 0.6,
            cursor: "not-allowed",
          }
        }),
      },
     
    },
  
  },
 
});

createInertiaApp({
    title: (title) => `${title}  ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob('./pages/**/*.tsx')),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ChakraProvider theme = {customTheme}>
                <App {...props} />
            </ChakraProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});

// This will set light / dark mode on load...
initializeTheme();