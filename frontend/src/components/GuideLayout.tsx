import React, { ReactNode } from 'react';
import {
  Box, Flex, Text, useColorModeValue, Icon, VStack, HStack,
  Avatar, IconButton, useDisclosure, Drawer, DrawerContent,
  DrawerOverlay, CloseButton, BoxProps, FlexProps,
} from '@chakra-ui/react';
import { IconType } from 'react-icons';
import {
  FiHome, FiBriefcase, FiCalendar, FiUser, FiSettings,
  FiLogOut, FiMenu, FiBell, FiStar, FiDollarSign,
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutGuide } from '../utils/logout';

interface NavItemProps extends FlexProps { icon: IconType; children: React.ReactNode; path: string; }
interface SidebarProps extends BoxProps { onClose: () => void; }
interface GuideLayoutProps { children: ReactNode; }

const LinkItems = [
  { name: 'Dashboard',   icon: FiHome,       path: '/guide/dashboard' },
  { name: 'Paket Wisata',icon: FiBriefcase,   path: '/guide/tours'    },
  { name: 'Pesanan',     icon: FiCalendar,    path: '/guide/bookings' },
  { name: 'Ulasan',      icon: FiStar,        path: '/guide/reviews'  },
  { name: 'Keuangan',    icon: FiDollarSign,  path: '/guide/wallet'   },
  { name: 'Profil',      icon: FiUser,        path: '/guide/profile'  },
];

const NavItem = ({ icon, children, path, ...rest }: NavItemProps) => {
  const navigate  = useNavigate();
  const location  = useLocation();
  const isActive  = location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <Flex
      onClick={() => navigate(path)} align="center" p="3" mx="4" borderRadius="lg"
      role="group" cursor="pointer"
      bg={isActive ? 'blue.400' : 'transparent'}
      color={isActive ? 'white' : useColorModeValue('gray.600', 'gray.200')}
      _hover={{ bg: 'blue.400', color: 'white' }} {...rest}
    >
      {icon && <Icon mr="4" fontSize="16" as={icon} />}
      {children}
    </Flex>
  );
};

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
  const logoutItemColor = useColorModeValue('gray.600', 'gray.200');
  const handleLogout = () => void logoutGuide();

  return (
    <Box
      bg={useColorModeValue('white', 'gray.800')}
      borderRight="1px" borderRightColor={useColorModeValue('gray.200', 'gray.700')}
      w={{ base: 'full', md: 60 }} pos="fixed" h="full" {...rest}
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
        <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">Travelink</Text>
        <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
      </Flex>

      {LinkItems.map(link => (
        <NavItem key={link.name} icon={link.icon} path={link.path}>{link.name}</NavItem>
      ))}

      <VStack pos="absolute" bottom="8" w="full" spacing={2} align="stretch">
        <NavItem icon={FiSettings} path="/guide/settings">Pengaturan</NavItem>
        <Flex
          onClick={handleLogout} align="center" p="3" mx="4" borderRadius="lg"
          role="group" cursor="pointer" color={logoutItemColor}
          _hover={{ bg: 'red.400', color: 'white' }}
        >
          <Icon mr="4" fontSize="16" as={FiLogOut} />
          Logout
        </Flex>
      </VStack>
    </Box>
  );
};

const GuideLayout: React.FC<GuideLayoutProps> = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const pageBg = useColorModeValue('gray.100', 'gray.900');
  const cardBg = useColorModeValue('white', 'gray.800');

  const guideRaw = localStorage.getItem('guide');
  const guide    = guideRaw ? JSON.parse(guideRaw) : null;
  const apiBase  = ((import.meta.env.VITE_API_URL as string) ?? '').replace('/api', '');
  const avatarSrc = guide?.profile_picture
    ? `${apiBase}/${guide.profile_picture.replace('public/', 'storage/')}`
    : undefined;

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
          <Text display={{ base: 'flex', md: 'none' }} fontSize="2xl" fontFamily="monospace" fontWeight="bold">
            Travelink
          </Text>
          <HStack spacing={{ base: '2', md: '6' }}>
            <IconButton size="lg" variant="ghost" aria-label="notifikasi" icon={<FiBell />} />
            <Flex alignItems="center">
              <HStack>
                <Avatar size="sm" src={avatarSrc} name={guide?.name ?? 'Guide'} />
                <VStack display={{ base: 'none', md: 'flex' }} alignItems="flex-start" spacing="1px" ml="2">
                  <Text fontSize="sm">{guide?.name ?? 'Guide'}</Text>
                  <Text fontSize="xs" color="gray.500">Pemandu Wisata</Text>
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

export default GuideLayout;
