import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Badge,
  Box,
  Button,
  Flex,
  Text,
  useColorModeValue,
  Icon,
  VStack,
  HStack,
  Avatar,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  CloseButton,
  BoxProps,
  FlexProps,
} from '@chakra-ui/react';
import { IconType } from 'react-icons';
import {
  FiShield,
  FiUsers,
  FiCreditCard,
  FiLogOut,
  FiMenu,
  FiBell,
  // HIDDEN: FiUserCheck,
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutAdmin } from '../utils/logout';
import { adminApiClient } from '../services/api';

interface NavItemProps extends FlexProps {
  icon: IconType;
  children: React.ReactNode;
  path: string;
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
  onLogout: () => void;
}

interface AdminLayoutProps {
  children: ReactNode;
}

const LinkItems = [
  { name: 'Verifikasi KYC',     icon: FiShield,     path: '/admin/kyc' },
  { name: 'Semua Guide',        icon: FiUsers,       path: '/admin/guides' },
  // HIDDEN: { name: 'Pengguna', icon: FiUserCheck, path: '/admin/users' },
  { name: 'Verifikasi Cairkan', icon: FiCreditCard,  path: '/admin/withdrawals' },
];

const NavItem = ({ icon, children, path, ...rest }: NavItemProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Flex
      onClick={() => navigate(path)}
      align="center"
      p="3"
      mx="4"
      borderRadius="lg"
      role="group"
      cursor="pointer"
      bg={isActive ? 'purple.500' : 'transparent'}
      color={isActive ? 'white' : useColorModeValue('gray.600', 'gray.200')}
      _hover={{ bg: 'purple.500', color: 'white' }}
      {...rest}
    >
      {icon && <Icon mr="4" fontSize="16" as={icon} />}
      {children}
    </Flex>
  );
};

const SidebarContent = ({ onClose, onLogout, ...rest }: SidebarProps) => {
  const logoutColor = useColorModeValue('gray.600', 'gray.200');

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderRight="1px"
      borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }}
      pos="fixed"
      h="full"
      {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Box>
          <Text fontSize="xl" fontFamily="monospace" fontWeight="bold">
            Travelink
          </Text>
          <Text fontSize="xs" color="purple.500" fontWeight="semibold" letterSpacing="wide">
            ADMIN PANEL
          </Text>
        </Box>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>

      {LinkItems.map((link) => (
        <NavItem key={link.name} icon={link.icon} path={link.path}>
          {link.name}
        </NavItem>
      ))}

      <VStack pos="absolute" bottom="8" w="full" spacing={2} align="stretch">
        <Flex
          onClick={onLogout}
          align="center"
          p="3"
          mx="4"
          borderRadius="lg"
          cursor="pointer"
          color={logoutColor}
          _hover={{ bg: 'red.400', color: 'white' }}
        >
          <Icon mr="4" fontSize="16" as={FiLogOut} />
          Logout
        </Flex>
      </VStack>
    </Box>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isOpen: isLogoutOpen, onOpen: openLogout, onClose: closeLogout } = useDisclosure();
  const logoutCancelRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const pageBg = useColorModeValue('gray.100', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const adminRaw = localStorage.getItem('admin');
  const admin = adminRaw ? JSON.parse(adminRaw) : null;

  const [unreadCount, setUnreadCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchUnread = () => {
      adminApiClient.get('/notifications')
          .then(res => setUnreadCount(res.data.unread_count ?? 0))
          .catch(() => {});
  };

  useEffect(() => {
      const token = localStorage.getItem('admin_token');
      if (!token) return;
      fetchUnread();
      pollRef.current = setInterval(fetchUnread, 30_000);
      return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  return (
    <Box minH="100vh" bg={pageBg}>
      <SidebarContent onClose={onClose} onLogout={openLogout} display={{ base: 'none', md: 'block' }} />
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerOverlay />
        <DrawerContent>
          <SidebarContent onClose={onClose} onLogout={openLogout} />
        </DrawerContent>
      </Drawer>

      <Flex ml={{ base: 0, md: 60 }} direction="column">
        {/* Header */}
        <Flex
          px={{ base: 4, md: 8 }}
          height="20"
          alignItems="center"
          bg={cardBg}
          borderBottomWidth="1px"
          borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
          justifyContent={{ base: 'space-between', md: 'flex-end' }}
        >
          <HStack display={{ base: 'flex', md: 'none' }} spacing={3} align="center">
            <IconButton
              onClick={onOpen}
              variant="outline"
              aria-label="buka menu"
              icon={<FiMenu />}
            />
            <VStack spacing={0} align="flex-start">
              <Text fontSize="xl" fontFamily="monospace" fontWeight="bold" lineHeight="1.1">
                Travelink
              </Text>
              <Text fontSize="xs" color="purple.500" fontWeight="semibold" letterSpacing="wide">
                Admin
              </Text>
            </VStack>
          </HStack>

          <HStack spacing={{ base: '2', md: '6' }}>
            <Box position="relative" display="inline-flex">
              <IconButton
                size="lg"
                variant="ghost"
                aria-label="Notifikasi"
                icon={<FiBell />}
                onClick={() => navigate('/notifications?role=admin')}
              />
              {unreadCount > 0 && (
                <Badge
                  position="absolute"
                  top="2px"
                  right="2px"
                  colorScheme="red"
                  borderRadius="full"
                  fontSize="10px"
                  minW="18px"
                  h="18px"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Box>
            <Flex alignItems="center">
              <HStack>
                <Avatar
                  size="sm"
                  name={admin?.name ?? 'Admin'}
                  bg="purple.500"
                  color="white"
                />
                <VStack
                  display={{ base: 'none', md: 'flex' }}
                  alignItems="flex-start"
                  spacing="1px"
                  ml="2"
                >
                  <Text fontSize="sm">{admin?.name ?? 'Admin'}</Text>
                  <Text fontSize="xs" color="purple.500" fontWeight="semibold">
                    Administrator
                  </Text>
                </VStack>
              </HStack>
            </Flex>
          </HStack>
        </Flex>

        {/* Konten halaman */}
        <Box as="main" p={{ base: 4, md: 8 }}>
          {children}
        </Box>
      </Flex>

      {/* Dialog konfirmasi logout admin */}
      <AlertDialog
        isOpen={isLogoutOpen}
        leastDestructiveRef={logoutCancelRef}
        onClose={closeLogout}
        isCentered
      >
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Keluar dari Travelink
            </AlertDialogHeader>
            <AlertDialogBody>Apakah Anda yakin ingin keluar?</AlertDialogBody>
            <AlertDialogFooter gap={3}>
              <Button ref={logoutCancelRef} bg="blue.500" color="white" _hover={{ bg: 'blue.600' }} onClick={closeLogout}>Tidak</Button>
              <Button bg="red.500" color="white" _hover={{ bg: 'red.600' }} onClick={() => void logoutAdmin()}>Ya, Keluar</Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
};

export default AdminLayout;
