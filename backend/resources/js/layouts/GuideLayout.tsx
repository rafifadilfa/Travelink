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
    FiMenu,
    FiBell,
} from 'react-icons/fi';
import { Link, usePage } from '@inertiajs/react';

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

// --- PERUBAHAN 1: "Settings" DIHAPUS DARI SINI ---
const LinkItems = [
    { name: 'Dashboard', icon: FiHome, path: route('guide.dashboard') },
    { name: 'My Tours', icon: FiBriefcase, path: route('guide.tours.show') },
    { name: 'Bookings', icon: FiCalendar, path: route('guide.bookings') },
    { name: 'Profile', icon: FiUser, path: route('guide.profile') },
];

// --- CHILD COMPONENTS ---
const NavItem = ({ icon, children, path, ...rest }: NavItemProps) => {
    const isActive = location.pathname === path;
    const NavItemColor = useColorModeValue('gray.600', 'gray.200');

    if(path === route('guide.logout')){
        return (
            <Link href={path} method="post" style={{textDecoration: 'none'}} >
                <Flex
                    align="center"
                    p="3"
                    mx="4"
                    borderRadius="lg"
                    role="group"
                    cursor="pointer"
                    bg={isActive ? 'blue.400' : 'transparent'}
                    color={isActive ? 'white' : NavItemColor}
                    _hover={{
                        bg: 'blue.400',
                        color: 'white',
                    }}
                    {...rest}
                >
                    {icon && <Icon mr="4" fontSize="16" as={icon} />}
                    {children}
                </Flex>        
            </Link>

        );
    }
    else{
        return (
            <Link href={path} style={{textDecoration: 'none'}}>
                <Flex
                    align="center"
                    p="3"
                    mx="4"
                    borderRadius="lg"
                    role="group"
                    cursor="pointer"
                    bg={isActive ? 'blue.400' : 'transparent'}
                    color={isActive ? 'white' : NavItemColor}
                    _hover={{
                        bg: 'blue.400',
                        color: 'white',
                    }}
                    {...rest}
                >
                    {icon && <Icon mr="4" fontSize="16" as={icon} />}
                    {children}
                </Flex>        
            </Link>

        );
    }

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
            
            <NavItem icon={FiSettings} path={route('guide.setting')}>
                Settings
            </NavItem>

            {/* <NavItem
                icon={FiLogOut} path={route('guide.logout')}>
                Logout
            </NavItem> */}

        </VStack>
    </Box>
  );
};

export default function GuideLayout( {children}: GuideLayoutProps ){
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { auth } = usePage().props;
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
                                <Avatar size={'sm'} src={auth.guide.profile_picture ? `/storage/${auth.guide.profile_picture}` : `https://ui-avatars.com/api/?name=${auth.guide.name}`}/>
                                <VStack display={{ base: 'none', md: 'flex' }} alignItems="flex-start" spacing="1px" ml="2">
                                    <Text fontSize="sm">{auth.guide.name}</Text>
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
}

// --- MAIN LAYOUT COMPONENT ---
// const GuideLayout: React.FC<GuideLayoutProps> = ({ children }) => {
    
// };

// export default GuideLayout;