import { useState, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  Button,
  Divider,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  HStack,
  Icon
} from '@chakra-ui/react';
import { FiAlertTriangle } from 'react-icons/fi';
import { router } from '@inertiajs/react';
import GuideLayout from '../layouts/GuideLayout';

export default function GuideSettings(){
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  const handleLogOut = () => {
    const link = route('guide.logout');
    router.post(link);
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const dangerZoneBorder = useColorModeValue('red.200', 'red.700');
  const secondaryTextColor = useColorModeValue('gray.600', 'gray.400');

  return (
    <GuideLayout>
      <Box maxW="container.md" mx="auto">
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading as="h1" size="xl">Settings</Heading>
            <Text color={secondaryTextColor} mt={1}>Manage your account settings.</Text>
          </Box>
          
          {/* Danger Zone untuk Aksi Berbahaya */}
          <Box
            bg={cardBg}
            p={{ base: 6, md: 8 }}
            borderRadius="lg"
            boxShadow="md"
            border="1px solid"
            borderColor={dangerZoneBorder}
          >
            <VStack spacing={4} align="stretch">
              <HStack>
                <Icon as={FiAlertTriangle} color="red.500" boxSize={6} />
                <Heading size="lg" color="red.500">Danger Zone</Heading>
              </HStack>
              <Divider />
              <Button
                colorScheme="red"
                w={{ base: 'full', md: 'auto' }}
                alignSelf="flex-start"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Log Out
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>

      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Log Out
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure you want to log out of this account?
            </AlertDialogBody>

            <AlertDialogFooter>

              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
            
              <Button colorScheme="red" onClick={handleLogOut} ml={3}>
                Confirm
              </Button>

            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </GuideLayout>
  );
};