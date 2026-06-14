import React, { ReactNode, useEffect, useRef, useState } from 'react';
import {
  Alert, AlertDescription, AlertIcon, AlertTitle,
  AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
  AlertDialogHeader, AlertDialogOverlay,
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
  onLogout?: () => void;
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

const SidebarContent = ({ onClose, onNavigate, onLogout, ...rest }: SidebarProps) => {
  const logoutItemColor = useColorModeValue('gray.600', 'gray.200');

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
                <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold">
                    Travelink
                </Text>
                <Text fontSize="xs" color="blue.500" fontWeight="semibold" letterSpacing="wide">
                    PEMANDU WISATA
                </Text>
            </Box>
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
            <Flex
                onClick={onLogout}
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
    const { isOpen: isLogoutOpen, onOpen: openLogout, onClose: closeLogout } = useDisclosure();
    const logoutCancelRef = useRef<HTMLButtonElement>(null);
    const navigate = useNavigate();
    const toast    = useToast();

    const [unreadCount, setUnreadCount] = useState(0);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const parseGuide = () => {
        const raw = localStorage.getItem('guide');
        return raw ? JSON.parse(raw) : null;
    };
    const [guide, setGuide] = useState(parseGuide);

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

        guideApiClient.get<{ guide: typeof guide }>('/guide/auth/guide')
            .then(res => {
                const fresh = res.data.guide;
                setGuide(fresh);
                localStorage.setItem('guide', JSON.stringify(fresh));
            })
            .catch(() => {});

        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    const pageBg = useColorModeValue('gray.100', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

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

    const location = useLocation();
    const isOnRestrictedPath = RESTRICTED_PATHS.includes(location.pathname);

    const apiBase = ((import.meta.env.VITE_API_URL as string) ?? '').replace('/api', '');
    const avatarSrc = guide?.profile_picture
        ? `${apiBase}/storage/${guide.profile_picture}`
        : undefined;

    return (
        <Box minH="100vh" bg={pageBg}>
            <SidebarContent onClose={onClose} onNavigate={handleNavigation} onLogout={openLogout} display={{ base: 'none', md: 'block' }} />
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
                    <SidebarContent onClose={onClose} onNavigate={handleNavigation} onLogout={openLogout} />
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
                    <HStack display={{ base: 'flex', md: 'none' }} spacing={3} align="center">
                        <IconButton
                            onClick={onOpen}
                            variant="outline"
                            aria-label="open menu"
                            icon={<FiMenu />}
                        />
                        <VStack spacing={0} align="flex-start">
                            <Text fontSize="2xl" fontFamily="monospace" fontWeight="bold" lineHeight="1.1">
                                Travelink
                            </Text>
                            <Text fontSize="xs" color="blue.500" fontWeight="semibold" letterSpacing="wide">
                                PEMANDU WISATA
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
                                onClick={() => navigate('/notifications?role=guide')}
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
                        <Flex
                            alignItems="center"
                            cursor="pointer"
                            borderRadius="lg"
                            px={2} py={1}
                            _hover={{ bg: useColorModeValue('gray.100', 'gray.700') }}
                            transition="background 0.15s"
                            onClick={() => navigate('/guide/profile')}
                            title="Lihat Profil Saya"
                        >
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
                    {/* TC-022: Guard route terbatas untuk guide yang belum terverifikasi */}
                    {!isVerified && isOnRestrictedPath ? (
                        <Alert
                            status="warning"
                            borderRadius="xl"
                            flexDirection="column"
                            alignItems="flex-start"
                            p={6}
                            gap={1}
                        >
                            <HStack>
                                <AlertIcon boxSize={5} />
                                <AlertTitle fontSize="md">Fitur Belum Dapat Diakses</AlertTitle>
                            </HStack>
                            <AlertDescription fontSize="sm" mt={1}>
                                Fitur ini hanya tersedia untuk pemandu wisata yang sudah terverifikasi.
                                Lengkapi profil dan verifikasi dokumen Anda terlebih dahulu,
                                lalu tunggu persetujuan admin.
                            </AlertDescription>
                            <Button
                                mt={4}
                                colorScheme="blue"
                                size="sm"
                                onClick={() => navigate('/guide/profile')}
                            >
                                Lengkapi Profil Saya
                            </Button>
                        </Alert>
                    ) : (
                        children
                    )}
                </Box>
            </Flex>

            {/* TC-010/011: Dialog konfirmasi logout pemandu */}
            <AlertDialog
                isOpen={isLogoutOpen}
                leastDestructiveRef={logoutCancelRef as React.RefObject<HTMLButtonElement>}
                onClose={closeLogout}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">Keluar dari Travelink</AlertDialogHeader>
                        <AlertDialogBody>Apakah Anda yakin ingin keluar?</AlertDialogBody>
                        <AlertDialogFooter gap={3}>
                            <Button ref={logoutCancelRef} bg="blue.500" color="white" _hover={{ bg: 'blue.600' }} onClick={closeLogout}>Tidak</Button>
                            <Button bg="red.500" color="white" _hover={{ bg: 'red.600' }} onClick={() => void logoutGuide()}>Ya, Keluar</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </Box>
    );
};

export default GuideLayout;