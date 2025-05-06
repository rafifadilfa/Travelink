import { Box, Button, Text } from "@chakra-ui/react";

function App() {
  return (
    <Box textAlign="center" p={10}>
      <Text fontSize="2xl" fontWeight="bold" color="teal.500">
        Hello, Chakra UI!
      </Text>
      <Button colorScheme="blue" mt={4}>
        Click Me
      </Button>
    </Box>
  );
}

export default App;
