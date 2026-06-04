import React, { ReactNode } from 'react';
import {
  Box, Flex, Text, useColorModeValue, Icon, VStack, HStack,
  Avatar, IconButton, useDisclosure, Drawer, DrawerContent,
  DrawerOverlay, CloseButton, BoxProps, FlexProps,
} from '@chakra-ui/react';
import { IconType } from 'react-icons';
import {
  FiShield, FiUsers, FiLogOut, FiMenu, FiBell,
  FiCreditCard, FiDownload,
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutAdmin } from '../utils/logout';

interface NavItemProps extends FlexProps { icon: IconType; children: React.ReactNode; path: string; }
interface SidebarProps extends BoxProps { onClose: () => void; }
interface AdminLayoutProps { children: ReactNode; }

const LinkItems = [
  { name: 'Verifikasi KYC',      icon: FiShield,     path: '/admin/kyc'         },
  { name: 'Semua Guide',         icon: FiUsers,      path: '/admin/guides'       },
  { name: 'Verifikasi Bayar',    icon: FiCreditCard, path: '/admin/payments'     },
  { name: 'Verifikasi Cairkan',  icon: FiDownload,   path: '/admin/withdrawals'  },
];

const NavItem = ({ icon, children, path, ...rest }: NavItemProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Flex
      onClick={() => navigate(path)} align="center" p="3" mx="4" borderRadius="lg"
      role="group" cursor="pointer"
      bg={isActive ? 'purple.500' : 'transparent'}
      color={isActive ? 'white' : useColorModeValue('gray.600', 'gray.200')}
      _hover={{ bg: 'purple.500', color: 'white' }} {...rest}
    >
      {icon && <Icon mr="4" fontSize="16" as={icon} />}
      {children}
    </Flex>
  );
};

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const logoutColor  = useColorModeValue('gray.600', 'gray.200');
  const handleLogout = () => void logoutAdmin();

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderRight="1px" borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }} pos="fixed" h="full" {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Box>
          <Text fontSize="xl" fontFamily="monospace" fontWeight="bold">Travelink</Text>
          <Text fontSize="xs" color="purple.500" fontWeight="semibold" letterSpacing="wide">ADMIN PANEL</Text>
        </Box>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>

      {LinkItems.map(link => (
        <NavItem key={link.name} icon={link.icon} path={link.path}>{link.name}</NavItem>
      ))}

      <VStack pos="absolute" bottom="8" w="full" spacing={2} align="stretch">
        <Flex onClick={handleLogout} align="center" p="3" mx="4" borderRadius="lg"
          cursor="pointer" color={logoutColor} _hover={{ bg: 'red.400', color: 'white' }}>
          <Icon mr="4" fontSize="16" as={FiLogOut} />
          Logout
        </Flex>
      </VStack>
    </Box>
  );
};

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pageBg = useColorModeValue('gray.100', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const adminRaw = localStorage.getItem('admin');
  const admin    = adminRaw ? JSON.parse(adminRaw) : null;

  return (
    <Box minH="100vh" bg={pageBg}>
      <SidebarContent onClose={onClose} display={{ base: 'none', md: 'block' }} />
      <Drawer autoFocus={false} isOpen={isOpen} placement="left" onClose={onClose}
        returnFocusOnClose={false} onOverlayClick={onClose} size="full">
        <DrawerOverlay />
        <DrawerContent><SidebarContent onClose={onClose} /></DrawerContent>
      </Drawer>

      <Flex ml={{ base: 0, md: 60 }} direction="column">
        <Flex px={{ base: 4, md: 8 }} height="20" alignItems="center" bg={cardBg}
          borderBottomWidth="1px" borderBottomColor={useColorModeValue('gray.200', 'gray.700')}
          justifyContent={{ base: 'space-between', md: 'flex-end' }}>
          <IconButton display={{ base: 'flex', md: 'none' }} onClick={onOpen}
            variant="outline" aria-label="buka menu" icon={<FiMenu />} />
          <Text display={{ base: 'flex', md: 'none' }} fontSize="xl" fontFamily="monospace" fontWeight="bold">
            Travelink Admin
          </Text>
          <HStack spacing={{ base: '2', md: '6' }}>
            <IconButton size="lg" variant="ghost" aria-label="notifikasi" icon={<FiBell />} />
            <Flex alignItems="center">
              <HStack>
                <Avatar size="sm" name={admin?.name ?? 'Admin'} bg="purple.500" color="white" />
                <VStack display={{ base: 'none', md: 'flex' }} alignItems="flex-start" spacing="1px" ml="2">
                  <Text fontSize="sm">{admin?.name ?? 'Admin'}</Text>
                  <Text fontSize="xs" color="purple.500" fontWeight="semibold">Administrator</Text>
                </VStack>
              </HStack>
            </Flex>
          </HStack>
        </Flex>
        <Box as="main" p={{ base: 4, md: 8 }}>{children}</Box>
      </Flex>
    </Box>
  );
};

export default AdminLayout;
