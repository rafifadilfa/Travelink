import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Badge,
  Box,
  Flex,
  Text,
  useColorModeValue,
  Icon,
  VStack,
  HStack,
  Avatar,
  IconButton,
  useDisclosure,
  useToast,
  Drawer,
  DrawerContent,
  DrawerOverlay,
  CloseButton,
  BoxProps,
  FlexProps,
} from '@chakra-ui/react';
import { IconType } from 'react-icons';
import {
    FiHome,
    FiBriefcase,
    FiCalendar,
    FiUser,
    FiSettings,
    FiLogOut,
    FiMenu,
    FiBell,
    FiStar,
    FiDollarSign,
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';
import { logoutGuide } from '../utils/logout';
import { guideApiClient } from '../services/api';

// Route yang membutuhkan akun terverifikasi
const RESTRICTED_PATHS = ['/guide/tours', '/guide/bookings', '/guide/reviews', '/guide/wallet'];

// --- TYPE DEFINITIONS ---
interface NavItemProps extends FlexProps {
    icon: IconType;
    children: React.ReactNode;
    path: string;
    onNavigate?: (path: string) => void;
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
  onNavigate?: (path: string) => void;
}

interface GuideLayoutProps {
    children: ReactNode;
}

const LinkItems = [
    { name: 'Dashboard', icon: FiHome, path: '/guide/dashboard' },
    { name: 'My Tours', icon: FiBriefcase, path: '/guide/tours' },
    { name: 'Bookings', icon: FiCalendar, path: '/guide/bookings' },
    { name: 'Profile', icon: FiUser, path: '/guide/profile' },
    { name: 'Ulasan', icon: FiStar, path: '/guide/reviews' },
    { name: 'Keuangan', icon: FiDollarSign, path: '/guide/wallet' },
];

// --- CHILD COMPONENTS ---
const NavItem = ({ icon, children, path, onNavigate, ...rest }: NavItemProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Flex
        onClick={() => onNavigate ? onNavigate(path) : navigate(path)}
        align="center"
        p="3"
        mx="4"
        borderRadius="lg"
        role="group"
        cursor="pointer"
        bg={isActive ? 'blue.400' : 'transparent'}
        color={isActive ? 'white' : useColorModeValue('gray.600', 'gray.200')}
        _hover={{
            bg: 'blue.400',
            color: 'white',
        }}
        {...rest}
    >
        {icon && <Icon mr="4" fontSize="16" as={icon} />}
        {children}
    </Flex>
  );
};

const SidebarContent = ({ onClose, onNavigate, ...rest }: SidebarProps) => {
  const logoutItemColor = useColorModeValue('gray.600', 'gray.200');

  const handleLogout = () => void logoutGuide();

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
            <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                Travelink
            </Text>
            <CloseButton display={{ base: 'flex', md: 'none' }} onClick={onClose} />
        </Flex>
        {LinkItems.map((link) => (
          <NavItem key={link.name} icon={link.icon} path={link.path} onNavigate={onNavigate}>
            {link.name}
          </NavItem>
        ))}

        <VStack
            pos="absolute"
            bottom="8"
            w="full"
            spacing={2}
            align="stretch"
        >
            <NavItem icon={FiSettings} path="/guide/settings">
                Settings
            </NavItem>
            {/* Logout: pakai Flex dengan onClick, bukan NavItem dengan path,
                supaya bisa menjalankan handleLogout sebelum berpindah halaman */}
            <Flex
                onClick={handleLogout}
                align="center"
                p="3"
                mx="4"
                borderRadius="lg"
                role="group"
                cursor="pointer"
                color={logoutItemColor}
                _hover={{ bg: 'red.400', color: 'white' }}
            >
                <Icon mr="4" fontSize="16" as={FiLogOut} />
                Logout
            </Flex>
        </VStack>
    </Box>
  );
};

// --- MAIN LAYOUT COMPONENT ---
const GuideLayout: React.FC<GuideLayoutProps> = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const navigate = useNavigate();
    const toast    = useToast();

    const [unreadCount, setUnreadCount] = useState(0);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const fetchUnread = () => {
        guideApiClient.get('/notifications')
            .then(res => setUnreadCount(res.data.unread_count ?? 0))
            .catch(() => {});
    };

    useEffect(() => {
        const token = localStorage.getItem('guide_token');
        if (!token) return;
        fetchUnread();
        pollRef.current = setInterval(fetchUnread, 30_000);
        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    const pageBg = useColorModeValue('gray.100', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    // Baca data guide dari localStorage — disimpan saat login di GuideAuth.tsx
    const guideRaw   = localStorage.getItem('guide');
    const guide      = guideRaw ? JSON.parse(guideRaw) : null;
    const isVerified = guide?.verification_status === 'verified';

    const handleNavigation = (path: string) => {
        if (!isVerified && RESTRICTED_PATHS.includes(path)) {
            toast({
                title: 'Akses Terbatas',
                description: 'Lengkapi profil dan dokumen KYC Anda terlebih dahulu, lalu tunggu persetujuan admin untuk mengakses fitur ini.',
                status: 'warning',
                duration: 5000,
                isClosable: true,
                position: 'top',
            });
            navigate('/guide/dashboard');
            return;
        }
        navigate(path);
    };

    // Konversi path storage Laravel ke URL penuh untuk foto profil
    // Contoh: "public/guides/photos/file.jpg" → "http://localhost:8000/storage/guides/photos/file.jpg"
    const apiBase = ((import.meta.env.VITE_API_URL as string) ?? '').replace('/api', '');
    const avatarSrc = guide?.profile_picture
        ? `${apiBase}/${guide.profile_picture.replace('public/', 'storage/')}`
        : undefined;

    return (
        <Box minH="100vh" bg={pageBg}>
            <SidebarContent onClose={onClose} onNavigate={handleNavigation} display={{ base: 'none', md: 'block' }} />
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
                    <SidebarContent onClose={onClose} onNavigate={handleNavigation} />
                </DrawerContent>
            </Drawer>

            <Flex
                ml={{ base: 0, md: 60 }}
                direction="column"
            >
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
                     <IconButton
                        display={{ base: 'flex', md: 'none' }}
                        onClick={onOpen}
                        variant="outline"
                        aria-label="open menu"
                        icon={<FiMenu />}
                    />
                    
                    <Text display={{ base: 'flex', md: 'none' }} fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                        Travelink
                    </Text>

                    <HStack spacing={{ base: '2', md: '6' }}>
                        <Box position="relative" display="inline-flex">
                            <IconButton
                                size="lg"
                                variant="ghost"
                                aria-label="Notifikasi"
                                icon={<FiBell />}
                                onClick={() => navigate('/notifications')}
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
                        <Flex alignItems={'center'}>
                            <HStack>
                                <Avatar size={'sm'} src={avatarSrc} name={guide?.name ?? 'Guide'} />
                                <VStack display={{ base: 'none', md: 'flex' }} alignItems="flex-start" spacing="1px" ml="2">
                                    <Text fontSize="sm">{guide?.name ?? 'Guide'}</Text>
                                    <Text fontSize="xs" color="gray.500">
                                        Pemandu Wisata
                                    </Text>
                                </VStack>
                            </HStack>
                        </Flex>
                    </HStack>
                </Flex>

                {/* Main Content */}
                <Box as="main" p={{ base: 4, md: 8 }}>
                    {children}
                </Box>
            </Flex>
        </Box>
    );
};

export default GuideLayout;