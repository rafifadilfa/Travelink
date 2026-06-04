import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Heading, useColorModeValue, Icon, VStack, HStack, Button,
  IconButton, FormControl, FormLabel, Input, Textarea, Select, NumberInput,
  NumberInputField, SimpleGrid, useToast, Spinner
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout'; 

// --- TYPE DEFINITIONS (sama seperti di CreateTour) ---
interface ItineraryStep {
    time: string;
    activity: string;
}

// --- MOCK DATABASE & API CALL SIMULATION ---
// Kita akan menggunakan data tiruan yang sama dari GuideTours.tsx sebagai "database" kita
const toursDatabase = [
    { id: 'tour-01', title: 'Jakarta Historical City Tour', description: 'Explore the old city of Batavia.', location: 'Jakarta, Indonesia', category: 'city', price: '800000', duration: '6 hours', itinerary: [{time: '09:00', activity: 'Visit Fatahillah Square'}, {time: '12:00', activity: 'Lunch'}], included: ['Guide', 'Water'], excluded: ['Tickets'] },
    { id: 'tour-02', title: 'Bali Highlands Cultural Trip', description: 'A trip to the cultural heart of Bali.', location: 'Ubud, Bali', category: 'culture', price: '1100000', duration: '8 hours', itinerary: [{time: '10:00', activity: 'Monkey Forest'}, {time: '13:00', activity: 'Tegalalang Rice Terrace'}], included: ['Transport', 'Lunch'], excluded: ['Donations'] },
    { id: 'tour-03', title: 'Lombok Beach & Surfing Lessons', description: 'Learn to surf on the beautiful beaches of Lombok.', location: 'Kuta, Lombok', category: 'beach', price: '950000', duration: '5 hours', itinerary: [{time: '08:00', activity: 'Surfing lesson'}, {time: '11:00', activity: 'Relax on the beach'}], included: ['Surfboard', 'Instructor'], excluded: ['Snacks'] }
];

// Fungsi ini mensimulasikan pengambilan data dari database/API
const getTourById = (id: string) => {
    return toursDatabase.find(tour => tour.id === id);
}


// --- MAIN COMPONENT ---
const EditTour: React.FC = () => {
    const navigate = useNavigate();
    const { tourId } = useParams<{ tourId: string }>(); // Mengambil tourId dari URL
    const toast = useToast();

    // State untuk loading
    const [loading, setLoading] = useState(true);

    // Semua state form sama seperti di CreateTour
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const [price, setPrice] = useState('0');
    const [duration, setDuration] = useState('');
    const [category, setCategory] = useState('');
    const [itinerary, setItinerary] = useState<ItineraryStep[]>([{ time: '', activity: '' }]);
    const [included, setIncluded] = useState<string[]>(['']);
    const [excluded, setExcluded] = useState<string[]>(['']);

    // useEffect untuk mengambil data saat komponen dimuat
    useEffect(() => {
        if (tourId) {
            setLoading(true);
            // Simulasikan jeda waktu untuk API call
            setTimeout(() => {
                const tourData = getTourById(tourId);
                if (tourData) {
                    // Isi semua state form dengan data yang didapat
                    setTitle(tourData.title);
                    setDescription(tourData.description);
                    setLocation(tourData.location);
                    setPrice(tourData.price);
                    setDuration(tourData.duration);
                    setCategory(tourData.category);
                    setItinerary(tourData.itinerary);
                    setIncluded(tourData.included);
                    setExcluded(tourData.excluded);
                } else {
                    toast({ title: "Tour not found", status: "error" });
                    navigate('/guide/tours');
                }
                setLoading(false);
            }, 500); // jeda 0.5 detik
        }
    }, [tourId, navigate, toast]);


    const cardBg = useColorModeValue('white', 'gray.800');
    const inputBg = useColorModeValue('gray.50', 'gray.700');
    
    // --- Semua handler (handleItineraryChange, dll.) sama persis dengan CreateTour.tsx ---
    // (Untuk mempersingkat, kita bisa salin-tempel dari CreateTour.tsx jika diperlukan, tapi kode di bawah sudah lengkap)
    const handleItineraryChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        const newItinerary = itinerary.map((item, i) => i === index ? { ...item, [name as keyof ItineraryStep]: value } : item);
        setItinerary(newItinerary);
    };
    const handleAddItineraryStep = () => setItinerary([...itinerary, { time: '', activity: '' }]);
    const handleRemoveItineraryStep = (index: number) => { if (itinerary.length > 1) { const values = [...itinerary]; values.splice(index, 1); setItinerary(values); } };
    const handleListChange = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number, event: React.ChangeEvent<HTMLInputElement>) => { const values = [...list]; values[index] = event.target.value; setter(values); };
    const handleAddItemToList = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[]) => setter([...list, '']);
    const handleRemoveItemFromList = (setter: React.Dispatch<React.SetStateAction<string[]>>, list: string[], index: number) => { if (list.length > 1) { const values = [...list]; values.splice(index, 1); setter(values); } };


    // --- Form Submission ---
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const updatedTourData = { tourId, title, description, location, price, duration, category, itinerary, included, excluded };
        console.log("Tour Data Updated:", updatedTourData);
        toast({
            title: "Tour Updated!",
            description: "Your tour changes have been saved.",
            status: "success",
            duration: 5000,
            isClosable: true,
            position: 'top'
        });
        navigate('/guide/tours');
    };

    // Tampilkan spinner saat loading
    if (loading) {
        return (
            <GuideLayout>
                <Flex justify="center" align="center" height="50vh">
                    <Spinner size="xl" />
                    <Text ml={4}>Loading Tour Data...</Text>
                </Flex>
            </GuideLayout>
        );
    }
    
    // Tampilan form (identik dengan CreateTour.tsx, hanya judul dan tombol yang berbeda)
    return (
        <GuideLayout>
            <Box maxW="container.lg" mx="auto">
                <Heading as="h1" size="xl" mb={8}>
                    Edit Your Tour
                </Heading>
                
                <form onSubmit={handleSubmit}>
                    <VStack spacing={8} align="stretch">
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>Basic Information</Heading>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Tour Title</FormLabel>
                                    <Input placeholder="e.g., Jakarta Historical City Tour" value={title} onChange={(e) => setTitle(e.target.value)} bg={inputBg} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Description</FormLabel>
                                    <Textarea placeholder="Give a detailed and exciting description of your tour." value={description} onChange={(e) => setDescription(e.target.value)} bg={inputBg} rows={5} />
                                </FormControl>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                    <FormControl isRequired>
                                        <FormLabel>Location</FormLabel>
                                        <Input placeholder="e.g., Bali, Indonesia" value={location} onChange={(e) => setLocation(e.target.value)} bg={inputBg}/>
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Category</FormLabel>
                                        <Select placeholder="Select a category" value={category} onChange={(e) => setCategory(e.target.value)} bg={inputBg}>
                                            <option value="beach">Beach</option> <option value="mountain">Mountain</option> <option value="city">City</option> <option value="culture">Culture</option> <option value="diving">Diving</option> <option value="nature">Nature</option>
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                    <FormControl isRequired>
                                        <FormLabel>Price per Person (in IDR)</FormLabel>
                                        <NumberInput min={0} value={`Rp ${Number(price).toLocaleString('id-ID')}`} onChange={(valueString) => setPrice(valueString.replace(/[^0-9]/g, ''))}>
                                            <NumberInputField bg={inputBg} />
                                        </NumberInput>
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Tour Duration</FormLabel>
                                        <Input placeholder="e.g., 8 hours or 3 days" value={duration} onChange={(e) => setDuration(e.target.value)} bg={inputBg} />
                                    </FormControl>
                                </SimpleGrid>
                            </VStack>
                        </Box>
                        
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                             <Heading size="lg" mb={6}>Tour Photos</Heading>
                             <Flex border="2px dashed" borderColor={useColorModeValue('gray.300', 'gray.600')} borderRadius="lg" p={10} align="center" justify="center" direction="column" cursor="pointer" _hover={{ borderColor: 'blue.400' }}>
                                <Icon as={FiUploadCloud} w={12} h={12} color="gray.500" />
                                <Text mt={4} color="gray.500">Click here to upload photos</Text>
                                <Text fontSize="sm" color="gray.500">(This is a visual placeholder)</Text>
                             </Flex>
                        </Box>

                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>Itinerary</Heading>
                            <VStack spacing={4} align="stretch">
                                {itinerary.map((step, index) => (
                                    <HStack key={index} spacing={4}>
                                        <Input placeholder="Time (e.g., 09:00 AM)" name="time" value={step.time} onChange={e => handleItineraryChange(index, e)} bg={inputBg} w="150px"/>
                                        <Input placeholder="Activity description" name="activity" value={step.activity} onChange={e => handleItineraryChange(index, e)} bg={inputBg} />
                                        <IconButton icon={<FiTrash2 />} aria-label="Remove step" colorScheme="red" variant="ghost" onClick={() => handleRemoveItineraryStep(index)} isDisabled={itinerary.length === 1} />
                                    </HStack>
                                ))}
                                <Button leftIcon={<FiPlus />} onClick={handleAddItineraryStep} alignSelf="flex-start">Add Step</Button>
                            </VStack>
                        </Box>
                        
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

                        <Flex justify="flex-end" gap={4} py={4}>
                             <Button variant="ghost" onClick={() => navigate('/guide/tours')}>Cancel</Button>
                             <Button colorScheme="blue" type="submit">Save Changes</Button>
                        </Flex>
                    </VStack>
                </form>
            </Box>
        </GuideLayout>
    );
};

export default EditTour;