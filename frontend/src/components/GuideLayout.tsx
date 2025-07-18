import React, { ReactNode } from 'react';
import {
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
} from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

// --- TYPE DEFINITIONS ---
interface NavItemProps extends FlexProps {
    icon: IconType;
    children: React.ReactNode;
    path: string;
}

interface SidebarProps extends BoxProps {
  onClose: () => void;
}

interface GuideLayoutProps {
    children: ReactNode;
}

// --- MOCK DATA & CONFIG ---
const guideData = {
    name: "Budi Hartono",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg"
};

// --- PERUBAHAN 1: "Settings" DIHAPUS DARI SINI ---
const LinkItems = [
    { name: 'Dashboard', icon: FiHome, path: '/guide/dashboard' },
    { name: 'My Tours', icon: FiBriefcase, path: '/guide/tours' },
    { name: 'Bookings', icon: FiCalendar, path: '/guide/bookings' },
    { name: 'Profile', icon: FiUser, path: '/guide/profile' },
];

// --- CHILD COMPONENTS ---
const NavItem = ({ icon, children, path, ...rest }: NavItemProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <Flex
        onClick={() => navigate(path)}
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

const SidebarContent = ({ onClose, ...rest }: SidebarProps) => {
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
          <NavItem key={link.name} icon={link.icon} path={link.path}>
            {link.name}
          </NavItem>
        ))}

        {/* --- PERUBAHAN 2: GRUP BARU UNTUK SETTINGS & LOGOUT DI BAWAH --- */}
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
            <NavItem icon={FiLogOut} path="/">
                Logout
            </NavItem>
        </VStack>
    </Box>
  );
};

// --- MAIN LAYOUT COMPONENT ---
const GuideLayout: React.FC<GuideLayoutProps> = ({ children }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    
    const pageBg = useColorModeValue('gray.100', 'gray.900');
    const cardBg = useColorModeValue('white', 'gray.800');

    return (
        <Box minH="100vh" bg={pageBg}>
            <SidebarContent onClose={onClose} display={{ base: 'none', md: 'block' }} />
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
                    <SidebarContent onClose={onClose} />
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
                        <IconButton
                            size="lg"
                            variant="ghost"
                            aria-label="open menu"
                            icon={<FiBell />}
                        />
                        <Flex alignItems={'center'}>
                            <HStack>
                                <Avatar size={'sm'} src={guideData.avatar}/>
                                <VStack display={{ base: 'none', md: 'flex' }} alignItems="flex-start" spacing="1px" ml="2">
                                    <Text fontSize="sm">{guideData.name}</Text>
                                    <Text fontSize="xs" color="gray.500">
                                        Pro Guide
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