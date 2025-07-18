import React, { useState, useRef } from 'react';
import {
  Box,
  Heading,
  Text,
  useColorModeValue,
  VStack,
  Button,
  useToast,
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
import { useNavigate } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';

const GuideSettings: React.FC = () => {
  const navigate = useNavigate();
  const toast = useToast();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const handleDeleteAccount = () => {
    // Di aplikasi nyata, di sini Anda akan memanggil API untuk menghapus akun
    console.log("Account deletion process initiated.");

    toast({
      title: 'Account Deleted',
      description: "Your account has been permanently deleted.",
      status: 'success',
      duration: 4000,
      isClosable: true,
    });

    // Arahkan pengguna keluar dari area guide, misalnya ke halaman login utama
    navigate('/');
  };

  const cardBg = useColorModeValue('white', 'gray.800');
  const dangerZoneBg = useColorModeValue('red.50', 'red.900');
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
              <Box>
                <Heading size="md" mb={2}>Delete Your Account</Heading>
                <Text color={secondaryTextColor}>
                  Once you delete your account, there is no going back. All of your data including your tours, bookings, and profile information will be permanently removed. Please be certain.
                </Text>
              </Box>
              <Button
                colorScheme="red"
                w={{ base: 'full', md: 'auto' }}
                alignSelf="flex-start"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                Delete My Account
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Box>

      {/* Dialog Konfirmasi Hapus Akun */}
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        leastDestructiveRef={cancelRef as any}
        onClose={() => setIsDeleteDialogOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Confirm Account Deletion
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you absolutely sure? This action is irreversible and will delete all your data.
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDeleteAccount} ml={3}>
                Yes, Delete My Account
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </GuideLayout>
  );
};

export default GuideSettings;