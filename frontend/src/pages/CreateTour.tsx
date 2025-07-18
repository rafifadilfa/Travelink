import React, { useState } from 'react';
import {
  Box,
  Flex,
  Text,
  Heading,
  useColorModeValue,
  Icon,
  VStack,
  HStack,
  Button,
  IconButton,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  NumberInput,
  NumberInputField,
  SimpleGrid,
  useToast
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
// This is the corrected import path. It goes UP one level from 'pages' to 'src',
// and then DOWN into 'components' to find the GuideLayout.
import GuideLayout from '../components/GuideLayout'; 

// --- TYPE DEFINITIONS ---
interface ItineraryStep {
    time: string;
    activity: string;
}

// --- MAIN COMPONENT ---
const CreateTour: React.FC = () => {
    const navigate = useNavigate();
    const toast = useToast();
    
    // State for the main form fields
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('0');
    const [duration, setDuration] = useState('');
    const [category, setCategory] = useState('');

    // State for dynamic itinerary steps
    const [itinerary, setItinerary] = useState<ItineraryStep[]>([{ time: '', activity: '' }]);
    
    // State for included/excluded items
    const [included, setIncluded] = useState<string[]>(['']);
    const [excluded, setExcluded] = useState<string[]>(['']);

    const cardBg = useColorModeValue('white', 'gray.800');
    const inputBg = useColorModeValue('gray.50', 'gray.700');

    // --- Itinerary Handlers with correct types ---
    const handleItineraryChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const newItinerary = itinerary.map((item, i) => {
            if (i === index) {
                // Correctly handle dynamic keys with TypeScript
                return { ...item, [name as keyof ItineraryStep]: value };
            }
            return item;
        });
        setItinerary(newItinerary);
    };

    const handleAddItineraryStep = () => {
        setItinerary([...itinerary, { time: '', activity: '' }]);
    };

    const handleRemoveItineraryStep = (index: number) => {
        if (itinerary.length > 1) {
            const values = [...itinerary];
            values.splice(index, 1);
            setItinerary(values);
        }
    };

    // --- Generic Handlers for Included/Excluded Lists with correct types ---
    const handleListChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const values = [...list];
        values[index] = event.target.value;
        setter(values);
    };

    const handleAddItemToList = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) => {
        setter([...list, '']);
    };
    
    const handleRemoveItemFromList = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number) => {
        if (list.length > 1) {
            const values = [...list];
            values.splice(index, 1);
            setter(values);
        }
    };

    // --- Form Submission ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const tourData = { title, description, location, price, duration, category, itinerary, included, excluded };
        console.log("Tour Data Submitted:", tourData);
        toast({
            title: "Tour Created!",
            description: "Your new tour has been saved as a draft.",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: 'top'
        });
        navigate('/guide/tours');
    };

    return (
        <GuideLayout>
            <Box maxW="container.lg" mx="auto">
                <Heading as="h1" size="xl" mb={8}>
                    Create a New Tour
                </Heading>
                
                <form onSubmit={handleSubmit}>
                    <VStack spacing={8} align="stretch">
                        {/* Basic Information Section */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>Basic Information</Heading>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Tour Title</FormLabel>
                                    <Input 
                                        placeholder="e.g., Jakarta Historical City Tour" 
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        bg={inputBg}
                                    />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Description</FormLabel>
                                    <Textarea 
                                        placeholder="Give a detailed and exciting description of your tour." 
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        bg={inputBg}
                                        rows={5}
                                    />
                                </FormControl>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                    <FormControl isRequired>
                                        <FormLabel>Location</FormLabel>
                                        <Input 
                                            placeholder="e.g., Bali, Indonesia" 
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            bg={inputBg}
                                        />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Category</FormLabel>
                                        <Select 
                                            placeholder="Select a category"
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value)}
                                            bg={inputBg}
                                        >
                                            <option value="beach">Beach</option>
                                            <option value="mountain">Mountain</option>
                                            <option value="city">City</option>
                                            <option value="culture">Culture</option>
                                            <option value="diving">Diving</option>
                                            <option value="nature">Nature</option>
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                    <FormControl isRequired>
                                        <FormLabel>Price per Person (in IDR)</FormLabel>
                                        <NumberInput 
                                            min={0}
                                            value={`Rp ${Number(price).toLocaleString('id-ID')}`}
                                            onChange={(valueString) => setPrice(valueString.replace(/[^0-9]/g, ''))}
                                        >
                                            <NumberInputField bg={inputBg} />
                                        </NumberInput>
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Tour Duration</FormLabel>
                                        <Input 
                                            placeholder="e.g., 8 hours or 3 days" 
                                            value={duration}
                                            onChange={(e) => setDuration(e.target.value)}
                                            bg={inputBg}
                                        />
                                    </FormControl>
                                </SimpleGrid>
                            </VStack>
                        </Box>

                        {/* Image Upload Section */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                             <Heading size="lg" mb={6}>Tour Photos</Heading>
                             <Flex
                                border="2px dashed"
                                borderColor={useColorModeValue('gray.300', 'gray.600')}
                                borderRadius="lg"
                                p={10}
                                align="center"
                                justify="center"
                                direction="column"
                                cursor="pointer"
                                _hover={{ borderColor: 'blue.400' }}
                             >
                                <Icon as={FiUploadCloud} w={12} h={12} color="gray.500" />
                                <Text mt={4} color="gray.500">Click here to upload photos</Text>
                                <Text fontSize="sm" color="gray.500">(This is a visual placeholder)</Text>
                             </Flex>
                        </Box>

                        {/* Itinerary Section */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>Itinerary</Heading>
                            <VStack spacing={4} align="stretch">
                                {itinerary.map((step, index) => (
                                    <HStack key={index} spacing={4}>
                                        <Input 
                                            placeholder="Time (e.g., 09:00 AM)" 
                                            name="time"
                                            value={step.time}
                                            onChange={e => handleItineraryChange(index, e)}
                                            bg={inputBg}
                                            w="150px"
                                        />
                                        <Input 
                                            placeholder="Activity description"
                                            name="activity"
                                            value={step.activity}
                                            onChange={e => handleItineraryChange(index, e)}
                                            bg={inputBg}
                                        />
                                        <IconButton
                                            icon={<FiTrash2 />}
                                            aria-label="Remove step"
                                            colorScheme="red"
                                            variant="ghost"
                                            onClick={() => handleRemoveItineraryStep(index)}
                                            isDisabled={itinerary.length === 1}
                                        />
                                    </HStack>
                                ))}
                                <Button leftIcon={<FiPlus />} onClick={handleAddItineraryStep} alignSelf="flex-start">
                                    Add Step
                                </Button>
                            </VStack>
                        </Box>
                        
                        {/* Inclusions/Exclusions Section */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                             <Heading size="lg" mb={6}>What's Included & Excluded</Heading>
                             <SimpleGrid columns={{base: 1, md: 2}} spacing={6}>
                                <VStack align="stretch" spacing={3}>
                                    <Heading size="md" color="green.400">Included</Heading>
                                    {included.map((item, index) => (
                                        <HStack key={index}>
                                            <Input value={item} onChange={e => handleListChange(setIncluded, included, index, e)} placeholder="e.g., Hotel Pickup" bg={inputBg} />
                                            <IconButton icon={<FiTrash2 />} aria-label="Remove" onClick={() => handleRemoveItemFromList(setIncluded, included, index)} variant="ghost" isDisabled={included.length === 1}/>
                                        </HStack>
                                    ))}
                                    <Button size="sm" onClick={() => handleAddItemToList(setIncluded, included)} leftIcon={<FiPlus/>}>Add Included Item</Button>
                                </VStack>
                                <VStack align="stretch" spacing={3}>
                                    <Heading size="md" color="red.400">Excluded</Heading>
                                     {excluded.map((item, index) => (
                                        <HStack key={index}>
                                            <Input value={item} onChange={e => handleListChange(setExcluded, excluded, index, e)} placeholder="e.g., Personal Expenses" bg={inputBg} />
                                            <IconButton icon={<FiTrash2 />} aria-label="Remove" onClick={() => handleRemoveItemFromList(setExcluded, excluded, index)} variant="ghost" isDisabled={excluded.length === 1}/>
                                        </HStack>
                                    ))}
                                    <Button size="sm" onClick={() => handleAddItemToList(setExcluded, excluded)} leftIcon={<FiPlus/>}>Add Excluded Item</Button>
                                </VStack>
                             </SimpleGrid>
                        </Box>

                        {/* Form Actions */}
                        <Flex justify="flex-end" gap={4} py={4}>
                             <Button variant="ghost" onClick={() => navigate('/guide/tours')}>Cancel</Button>
                             <Button colorScheme="blue" type="submit">Save Draft & Create Tour</Button>
                        </Flex>
                    </VStack>
                </form>
            </Box>
        </GuideLayout>
    );
};

export default CreateTour;
