import {
  Box,
  Flex,
  Text,
  Heading,
  useColorModeValue,
  Icon,
  VStack,
} from '@chakra-ui/react';
import { IconType } from 'react-icons';
import { FiBriefcase, FiCalendar, FiArrowRight } from 'react-icons/fi';
import { Link, usePage } from '@inertiajs/react';
import GuideLayout from '../layouts/GuideLayout'; 

const ActionCard = ({ title, description, icon, path }: {title: string, description: string, icon: IconType, path: string}) => {
    const bg = useColorModeValue('white', 'gray.800');
    const borderColor = useColorModeValue('gray.200', 'gray.700');

    return (
        <Link href={path} style={{textDecoration: 'none'}} >
            <Flex
                p={6}
                bg={bg}
                borderRadius="lg"
                boxShadow="md"
                border="1px solid"
                borderColor={borderColor}
                align="center"
                transition="all 0.3s"
                _hover={{ transform: 'translateY(-5px)', boxShadow: 'lg', borderColor: 'blue.400' }}
                cursor="pointer"
            >
                <Icon as={icon} w={10} h={10} color="blue.400" mr={5} />
                <Box>
                    <Heading size="md">{title}</Heading>
                    <Text color={useColorModeValue('gray.600', 'gray.400')} mt={1}>
                        {description}
                    </Text>
                </Box>
                <Icon as={FiArrowRight} w={6} h={6} color="gray.400" ml="auto" />
            </Flex>        
        </Link>
    );
};

export default function GuideDashboard(){

    const secondaryTextColor = useColorModeValue('gray.500', 'gray.400');
    const { auth } = usePage().props;

    return (
        <GuideLayout>
            <Heading as="h1" size="xl" mb={2}>Welcome, {auth.guide.name.split(' ')[0]}!</Heading>
            <Text fontSize="lg" color={secondaryTextColor} mb={10}>This is your hub to manage your tours and bookings.</Text>

            <VStack spacing={6} align="stretch">
                <ActionCard 
                    title="Manage Your Tours"
                    description="Create a new tour, edit existing listings, and manage your availability."
                    icon={FiBriefcase}
                    path= {route('guide.tours.show')}
                />
                <ActionCard 
                    title="View Your Bookings"
                    description="See who has booked your tours and manage your upcoming schedule."
                    icon={FiCalendar}
                    path= {route('guide.bookings')}
                />
            </VStack>
        </GuideLayout>
    );
};