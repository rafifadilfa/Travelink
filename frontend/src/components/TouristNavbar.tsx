import React, { useEffect, useRef, useState } from 'react';
import {
    AlertDialog, AlertDialogBody, AlertDialogContent, AlertDialogFooter,
    AlertDialogHeader, AlertDialogOverlay,
    Avatar,
    Badge,
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    Icon,
    IconButton,
    Input,
    InputGroup,
    InputLeftElement,
    Text,
    Tooltip,
    useColorModeValue,
    useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon } from '@chakra-ui/icons';
import { FiBell, FiLogOut } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import apiClient from '../services/api';
import { logoutUser } from '../utils/logout';

interface UserProfile {
    name: string;
    profile_photo_path?: string | null;
}

const TouristNavbar: React.FC = () => {
    const navigate = useNavigate();
    const [searchInput,  setSearchInput]  = useState('');
    const [unreadCount,  setUnreadCount]  = useState(0);
    const [userProfile,  setUserProfile]  = useState<UserProfile | null>(() => {
        const raw = localStorage.getItem('user');
        return raw ? JSON.parse(raw) as UserProfile : null;
    });
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const { isOpen: isLogoutOpen, onOpen: openLogout, onClose: closeLogout } = useDisclosure();
    const logoutCancelRef = useRef<HTMLButtonElement>(null);

    const fetchUnread = () => {
        apiClient.get('/notifications')
            .then(res => setUnreadCount(res.data.unread_count ?? 0))
            .catch(() => {});
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;
        fetchUnread();
        pollRef.current = setInterval(fetchUnread, 30_000);

        apiClient.get<{ user: UserProfile }>('/auth/user')
            .then(res => {
                const fresh = res.data.user;
                setUserProfile(fresh);
                localStorage.setItem('user', JSON.stringify(fresh));
            })
            .catch(() => {});

        return () => { if (pollRef.current) clearInterval(pollRef.current); };
    }, []);

    const apiBase = ((import.meta.env.VITE_API_URL as string) ?? '').replace('/api', '');
    const avatarSrc = userProfile?.profile_photo_path
        ? `${apiBase}/storage/${userProfile.profile_photo_path}`
        : undefined;

    const glassBg          = useColorModeValue('rgba(255, 255, 255, 0.9)', 'rgba(26, 32, 44, 0.85)');
    const primaryColor     = useColorModeValue('blue.500', 'blue.400');
    const primaryHover     = useColorModeValue('blue.600', 'blue.500');
    const primaryTextColor = useColorModeValue('gray.700', 'whiteAlpha.900');
    const subtleBorder     = useColorModeValue('gray.200', 'gray.700');
    const accentGradient   = `linear(to-br, ${useColorModeValue('purple.400', 'purple.300')}, ${useColorModeValue('blue.500', 'blue.400')})`;
    const focusShadow      = useColorModeValue('blue.200', 'blue.700');
    const exploreHoverBg   = useColorModeValue('blue.50', 'rgba(49,130,206,0.1)');
    const btnEndColor      = useColorModeValue('blue.400', 'blue.300');
    const btnHoverEnd      = useColorModeValue('blue.500', 'blue.400');
    const inputBg          = useColorModeValue('white', 'gray.800');
    const logoutIconColor  = useColorModeValue('gray.500', 'gray.400');

    const handleSearch = () => {
        const kw = searchInput.trim();
        if (!kw) return;
        navigate(`/search?q=${encodeURIComponent(kw)}`);
        setSearchInput('');
    };

    const baseStyle = {
        borderRadius: 'lg',
        fontWeight: 'semibold',
        h: '44px',
        px: 5,
        fontSize: 'sm',
        transition: 'all 0.25s cubic-bezier(.08,.52,.52,1)',
        _active: { transform: 'translateY(1px) scale(0.97)', boxShadow: 'sm' },
        _focus: { boxShadow: `0 0 0 3px ${focusShadow}` },
    };

    const exploreBtnStyle = {
        ...baseStyle,
        bg: 'transparent',
        color: primaryColor,
        border: '2px solid',
        borderColor: primaryColor,
        _hover: {
            bg: exploreHoverBg,
            borderColor: primaryHover,
            color: primaryHover,
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: 'md',
        },
    };

    const bookingsBtnStyle = {
        ...baseStyle,
        bgGradient: `linear(to-r, ${primaryColor}, ${btnEndColor})`,
        color: 'white',
        boxShadow: 'md',
        _hover: {
            bgGradient: `linear(to-r, ${primaryHover}, ${btnHoverEnd})`,
            transform: 'translateY(-2px) scale(1.02)',
            boxShadow: 'lg',
        },
    };

    return (
        <>
            <Box
                bg={glassBg}
                backdropFilter="blur(18px)"
                boxShadow="md"
                position="sticky"
                top={0}
                zIndex={1000}
                borderBottom="1px solid"
                borderColor={subtleBorder}
            >
                <Container maxW="container.xl">
                    <Flex h="68px" justify="space-between" align="center" gap={4}>
                        {/* Logo */}
                        <Flex
                            align="center"
                            gap={2.5}
                            onClick={() => navigate('/dashboard')}
                            cursor="pointer"
                            role="link"
                            tabIndex={0}
                            flexShrink={0}
                            _focus={{ outline: '2px solid', outlineColor: 'blue.300', borderRadius: 'md' }}
                        >
                            <Flex
                                alignItems="center"
                                justifyContent="center"
                                boxSize="40px"
                                borderRadius="lg"
                                bgGradient={accentGradient}
                                boxShadow="lg"
                                transition="all 0.3s ease"
                                _hover={{ transform: 'rotate(-10deg) scale(1.1)', boxShadow: 'xl' }}
                            >
                                <Text fontSize="xl" color="white" fontWeight="bold">✈</Text>
                            </Flex>
                            <Heading as="h1" size="md" color={primaryTextColor} fontWeight="extrabold"
                                display={{ base: 'none', sm: 'block' }}>
                                Travelink
                            </Heading>
                        </Flex>

                        {/* Search bar */}
                        <InputGroup size="sm" maxW={{ base: '160px', md: '280px' }} flex="1">
                            <InputLeftElement pointerEvents="none">
                                <SearchIcon color="gray.400" boxSize={3.5} />
                            </InputLeftElement>
                            <Input
                                placeholder="Cari pemandu..."
                                value={searchInput}
                                onChange={e => setSearchInput(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                                bg={inputBg}
                                border="1px solid"
                                borderColor={subtleBorder}
                                borderRadius="full"
                                fontSize="sm"
                                _focus={{ borderColor: 'blue.400', boxShadow: `0 0 0 1px ${focusShadow}` }}
                            />
                        </InputGroup>

                        {/* Action buttons */}
                        <HStack spacing={2} flexShrink={0}>
                            <Button
                                {...exploreBtnStyle}
                                display={{ base: 'none', md: 'flex' }}
                                size="sm"
                                onClick={() => navigate('/tours')}
                                leftIcon={<Text as="span" role="img" aria-label="explore" mr={1}>🧭</Text>}
                            >
                                Explore
                            </Button>
                            <Button
                                {...bookingsBtnStyle}
                                display={{ base: 'none', md: 'flex' }}
                                size="sm"
                                onClick={() => navigate('/bookings')}
                                leftIcon={<Text as="span" role="img" aria-label="bookings" mr={1}>💼</Text>}
                            >
                                Booking Saya
                            </Button>

                            {/* Notifikasi */}
                            <Box position="relative" display="inline-flex">
                                <Tooltip label="Notifikasi" placement="bottom">
                                    <IconButton
                                        aria-label="Notifikasi"
                                        icon={<FiBell />}
                                        variant="ghost"
                                        size="md"
                                        onClick={() => navigate('/notifications?role=tourist')}
                                    />
                                </Tooltip>
                                {unreadCount > 0 && (
                                    <Badge
                                        position="absolute"
                                        top="-4px"
                                        right="-4px"
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

                            {/* Profil */}
                            <Tooltip label="Profil Saya" placement="bottom">
                                <Box
                                    onClick={() => navigate('/profile')}
                                    cursor="pointer"
                                    position="relative"
                                >
                                    <Avatar
                                        src={avatarSrc}
                                        name={userProfile?.name ?? 'User'}
                                        boxSize="38px"
                                        border="2px solid"
                                        borderColor="transparent"
                                        _hover={{ borderColor: primaryColor, transform: 'scale(1.08)', boxShadow: 'lg' }}
                                        transition="all 0.2s ease-in-out"
                                        boxShadow="md"
                                    />
                                    <Box
                                        position="absolute"
                                        top="-1px"
                                        right="-1px"
                                        boxSize="11px"
                                        borderRadius="full"
                                        bg="green.400"
                                        border="2px solid white"
                                    />
                                </Box>
                            </Tooltip>

                            {/* Logout */}
                            <Tooltip label="Keluar" placement="bottom">
                                <IconButton
                                    aria-label="Logout"
                                    variant="ghost"
                                    size="md"
                                    onClick={openLogout}
                                    icon={
                                        <Icon as={FiLogOut} boxSize="18px" />
                                    }
                                    color={logoutIconColor}
                                    _hover={{ bg: 'red.50', color: 'red.500' }}
                                    transition="all 0.2s ease"
                                />
                            </Tooltip>
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            {/* Dialog konfirmasi logout */}
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
                            <Button ref={logoutCancelRef} onClick={closeLogout}>Tidak</Button>
                            <Button colorScheme="red" onClick={() => void logoutUser()}>Ya</Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
};

export default TouristNavbar;
