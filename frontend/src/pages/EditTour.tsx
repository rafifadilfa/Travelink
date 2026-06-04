import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Heading, useColorModeValue, Icon, VStack, HStack, Button,
  IconButton, FormControl, FormLabel, Input, Textarea, Select, NumberInput,
  NumberInputField, SimpleGrid, useToast, Spinner,
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiUploadCloud } from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

interface ItineraryStep { time: string; activity: string; }

const EditTour: React.FC = () => {
    const navigate = useNavigate();
    const { tourId } = useParams<{ tourId: string }>();
    const toast = useToast();

    const [loading,       setLoading]       = useState(true);
    const [isSubmitting,  setIsSubmitting]  = useState(false);

    const [title,       setTitle]       = useState('');
    const [description, setDescription] = useState('');
    const [location,    setLocation]    = useState('');
    const [price,       setPrice]       = useState('0');
    const [duration,    setDuration]    = useState('');
    const [category,    setCategory]    = useState('');
    const [itinerary,   setItinerary]   = useState<ItineraryStep[]>([{ time: '', activity: '' }]);
    const [included,    setIncluded]    = useState<string[]>(['']);
    const [excluded,    setExcluded]    = useState<string[]>(['']);

    const cardBg  = useColorModeValue('white', 'gray.800');
    const inputBg = useColorModeValue('gray.50', 'gray.700');

    useEffect(() => {
        if (!tourId) return;
        guideApiClient.get(`/guide/tours/${tourId}`)
            .then(res => {
                const t = res.data.tour;
                setTitle(t.title ?? '');
                setDescription(t.description ?? '');
                setLocation(t.location ?? '');
                setPrice(t.price ?? '0');
                setDuration(t.duration ?? '');
                setCategory(t.category ?? '');
                setItinerary(t.itinerary?.length ? t.itinerary : [{ time: '', activity: '' }]);
                setIncluded(t.included?.length  ? t.included  : ['']);
                setExcluded(t.excluded?.length  ? t.excluded  : ['']);
            })
            .catch(() => {
                toast({ title: 'Tour tidak ditemukan', status: 'error' });
                navigate('/guide/tours');
            })
            .finally(() => setLoading(false));
    }, [tourId]);

    const handleItineraryChange = (index: number, event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setItinerary(prev => prev.map((item, i) =>
            i === index ? { ...item, [name as keyof ItineraryStep]: value } : item
        ));
    };

    const handleListChange = (
        setter: React.Dispatch<React.SetStateAction<string[]>>,
        list: string[], index: number,
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        const values = [...list];
        values[index] = event.target.value;
        setter(values);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await guideApiClient.put(`/guide/tours/${tourId}`, {
                title,
                description,
                location,
                price: Number(price),
                duration,
                category,
                itinerary: itinerary.filter(s => s.activity.trim()),
                included:  included.filter(s => s.trim()),
                excluded:  excluded.filter(s => s.trim()),
            });
            toast({
                title: 'Tour berhasil diperbarui!',
                status: 'success',
                duration: 5000,
                isClosable: true,
                position: 'top',
            });
            navigate('/guide/tours');
        } catch (err: any) {
            toast({
                title: 'Gagal memperbarui tour',
                description: err.response?.data?.message ?? 'Coba lagi.',
                status: 'error',
                duration: 5000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <GuideLayout>
                <Flex justify="center" align="center" height="50vh">
                    <Spinner size="xl" />
                    <Text ml={4}>Memuat data tour...</Text>
                </Flex>
            </GuideLayout>
        );
    }

    return (
        <GuideLayout>
            <Box maxW="container.lg" mx="auto">
                <Heading as="h1" size="xl" mb={8}>Edit Your Tour</Heading>

                <form onSubmit={handleSubmit}>
                    <VStack spacing={8} align="stretch">
                        {/* Basic Information */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>Basic Information</Heading>
                            <VStack spacing={4}>
                                <FormControl isRequired>
                                    <FormLabel>Tour Title</FormLabel>
                                    <Input placeholder="e.g., Jakarta Historical City Tour" value={title} onChange={e => setTitle(e.target.value)} bg={inputBg} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Description</FormLabel>
                                    <Textarea placeholder="Give a detailed and exciting description of your tour." value={description} onChange={e => setDescription(e.target.value)} bg={inputBg} rows={5} />
                                </FormControl>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                    <FormControl isRequired>
                                        <FormLabel>Location</FormLabel>
                                        <Input placeholder="e.g., Bali, Indonesia" value={location} onChange={e => setLocation(e.target.value)} bg={inputBg} />
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Category</FormLabel>
                                        <Select placeholder="Select a category" value={category} onChange={e => setCategory(e.target.value)} bg={inputBg}>
                                            <option value="Beach">Beach</option>
                                            <option value="Mountain">Mountain</option>
                                            <option value="City">City</option>
                                            <option value="Culture">Culture</option>
                                            <option value="Diving">Diving</option>
                                            <option value="Nature">Nature</option>
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                                    <FormControl isRequired>
                                        <FormLabel>Price per Person (in IDR)</FormLabel>
                                        <NumberInput min={0} value={`Rp ${Number(price).toLocaleString('id-ID')}`} onChange={v => setPrice(v.replace(/[^0-9]/g, ''))}>
                                            <NumberInputField bg={inputBg} />
                                        </NumberInput>
                                    </FormControl>
                                    <FormControl isRequired>
                                        <FormLabel>Tour Duration</FormLabel>
                                        <Input placeholder="e.g., 8 hours or 3 days" value={duration} onChange={e => setDuration(e.target.value)} bg={inputBg} />
                                    </FormControl>
                                </SimpleGrid>
                            </VStack>
                        </Box>

                        {/* Tour Photos (placeholder) */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>Tour Photos</Heading>
                            <Flex border="2px dashed" borderColor={useColorModeValue('gray.300', 'gray.600')} borderRadius="lg" p={10} align="center" justify="center" direction="column" cursor="pointer" _hover={{ borderColor: 'blue.400' }}>
                                <Icon as={FiUploadCloud} w={12} h={12} color="gray.500" />
                                <Text mt={4} color="gray.500">Click here to upload photos</Text>
                                <Text fontSize="sm" color="gray.500">(This is a visual placeholder)</Text>
                            </Flex>
                        </Box>

                        {/* Itinerary */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>Itinerary</Heading>
                            <VStack spacing={4} align="stretch">
                                {itinerary.map((step, index) => (
                                    <HStack key={index} spacing={4}>
                                        <Input placeholder="Time (e.g., 09:00 AM)" name="time" value={step.time} onChange={e => handleItineraryChange(index, e)} bg={inputBg} w="150px" />
                                        <Input placeholder="Activity description" name="activity" value={step.activity} onChange={e => handleItineraryChange(index, e)} bg={inputBg} />
                                        <IconButton icon={<FiTrash2 />} aria-label="Remove step" colorScheme="red" variant="ghost"
                                            onClick={() => { if (itinerary.length > 1) setItinerary(prev => prev.filter((_, i) => i !== index)); }}
                                            isDisabled={itinerary.length === 1} />
                                    </HStack>
                                ))}
                                <Button leftIcon={<FiPlus />} onClick={() => setItinerary(prev => [...prev, { time: '', activity: '' }])} alignSelf="flex-start">
                                    Add Step
                                </Button>
                            </VStack>
                        </Box>

                        {/* Inclusions / Exclusions */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>What's Included & Excluded</Heading>
                            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                                <VStack align="stretch" spacing={3}>
                                    <Heading size="md" color="green.400">Included</Heading>
                                    {included.map((item, index) => (
                                        <HStack key={index}>
                                            <Input value={item} onChange={e => handleListChange(setIncluded, included, index, e)} placeholder="e.g., Hotel Pickup" bg={inputBg} />
                                            <IconButton icon={<FiTrash2 />} aria-label="Remove"
                                                onClick={() => { if (included.length > 1) setIncluded(prev => prev.filter((_, i) => i !== index)); }}
                                                variant="ghost" isDisabled={included.length === 1} />
                                        </HStack>
                                    ))}
                                    <Button size="sm" onClick={() => setIncluded(prev => [...prev, ''])} leftIcon={<FiPlus />}>Add Included Item</Button>
                                </VStack>
                                <VStack align="stretch" spacing={3}>
                                    <Heading size="md" color="red.400">Excluded</Heading>
                                    {excluded.map((item, index) => (
                                        <HStack key={index}>
                                            <Input value={item} onChange={e => handleListChange(setExcluded, excluded, index, e)} placeholder="e.g., Personal Expenses" bg={inputBg} />
                                            <IconButton icon={<FiTrash2 />} aria-label="Remove"
                                                onClick={() => { if (excluded.length > 1) setExcluded(prev => prev.filter((_, i) => i !== index)); }}
                                                variant="ghost" isDisabled={excluded.length === 1} />
                                        </HStack>
                                    ))}
                                    <Button size="sm" onClick={() => setExcluded(prev => [...prev, ''])} leftIcon={<FiPlus />}>Add Excluded Item</Button>
                                </VStack>
                            </SimpleGrid>
                        </Box>

                        {/* Actions */}
                        <Flex justify="flex-end" gap={4} py={4}>
                            <Button variant="ghost" onClick={() => navigate('/guide/tours')}>Cancel</Button>
                            <Button colorScheme="blue" type="submit" isLoading={isSubmitting} loadingText="Menyimpan...">
                                Save Changes
                            </Button>
                        </Flex>
                    </VStack>
                </form>
            </Box>
        </GuideLayout>
    );
};

export default EditTour;
