import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Heading, useColorModeValue, Icon, VStack, HStack, Button,
  IconButton, FormControl, FormLabel, Input, Textarea, Select, NumberInput,
  NumberInputField, SimpleGrid, useToast, InputGroup, NumberDecrementStepper,
  NumberIncrementStepper, NumberInputStepper, Tag, TagLabel, TagCloseButton, Image
} from '@chakra-ui/react';
import { FiPlus, FiTrash2, FiUploadCloud, FiArrowDown, FiArrowUp, FiX } from 'react-icons/fi';
import { useForm } from '@inertiajs/react';
import GuideLayout from '../layouts/GuideLayout'; 

// --- TYPE DEFINITIONS ---

interface Tag{
  id: number;
  name: string;
}

interface Location{
    id: number;
    name: string;
}

interface MeetingPoint{
  id: number;
  name: string;
}

interface Category{
    id: number;
    name: string;
}

interface DayPhase{
    id: number;
    name: string;
    description: string;
}

interface Items{
    id: number;
    name: string;
    pivot: {
        is_included: boolean;
    };
}

interface Props{
  categories: Category[];
  dayphases: DayPhase[];
  meetingpoints: MeetingPoint[];
  locations: Location[];
  tags: Tag[];
  items: Items[];
}

export default function CreateTour({ categories, dayphases, meetingpoints, locations, tags, items }:Props){
    const toast = useToast();

    const [categoryToAdd, setCategoryToAdd] = useState<number | ''>('');
    const [tagToAdd, setTagToAdd] = useState<number | ''>('');
    const [itemToAdd, setItemToAdd] = useState<number | ''>('');
    
    type ItineraryFormData = {
        uid: string,
        id: number | null;
        step_number: number;
        start_time: string;
        activity: string;
        description: string;
    };

    type TourFormData = {
        name: string;
        tour_location_id: number | string;
        tour_meeting_point_id: number | string;
        tour_description: string;
        tour_price: number;
        tour_duration: number;
        tour_start_time: string;
        tour_period_id: number | string;
        tour_max_participants: number;
        tour_min_participants: number;
        featured: boolean;

        tour_itineraries: ItineraryFormData[];
        tour_categories: number[];
        tour_tags: number[];
        tour_items: number[];
        tour_images: File[];
    };

    const makeUid = () =>
        typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
        ? crypto.randomUUID()
        : `uid-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    
    const initialItineraries: ItineraryFormData[] =
    [
            {
            uid: makeUid(),
            id: null,
            step_number: 1,
            start_time: '',
            activity: '',
            description: '',
            },
    ];

    // 2. Initialize useForm with mapped values
    const { data, setData: setEditTourData, post} = useForm<TourFormData>({
        name: '',
        tour_location_id: '',
        tour_meeting_point_id: '',
        tour_description: '',
        tour_price: 10000,
        tour_duration: 2,
        tour_start_time: '',
        tour_period_id: '',
        tour_max_participants: 1,
        tour_min_participants: 1,
        featured: false,
        
        tour_itineraries: initialItineraries,

        tour_categories: [],
        tour_tags: [],
        tour_items: [],
        tour_images: [],
    });

    const [itinerary, setItinerary] = useState<ItineraryFormData[]>(initialItineraries);
    const [newImages, setNewImages] = useState<{ file: File; preview: string; caption: string }[]>([]);


    const includedItems = items.filter(item => 
        data.tour_items.includes(item.id)
    );

    const excludedItems = items.filter(item => 
        !data.tour_items.includes(item.id)
    );

    const availableItems = items.filter(item => 
        !data.tour_items.includes(item.id)
    ); 

    useEffect(() => {
    setEditTourData("tour_itineraries", itinerary);
    }, [itinerary, setEditTourData]);

    const handleAddItineraryStep = () => {
    setItinerary(prev => {
        const nextStepNumber = prev.length > 0 ? Math.max(...prev.map(s => s.step_number)) + 1 : 1;
        const newStep: ItineraryFormData = {
        uid: makeUid(),
        id: null,
        step_number: nextStepNumber,
        start_time: '',
        activity: '',
        description: '',
        };
        return [...prev, newStep];
    });
    };

    const handleRemoveItineraryStep = (uidToRemove: string) => {
        setItinerary(prev => {
            if (prev.length <= 1) return prev; // keep at least one
            const filtered = prev.filter(step => step.uid !== uidToRemove);
            const resequenced = filtered
            .sort((a, b) => a.step_number - b.step_number)
            .map((step, idx) => ({ ...step, step_number: idx + 1 }));
            return resequenced;
        });
    };

    const moveStep = (index: number, direction: "up" | "down") => {
        setItinerary((prev) => {
        const newOrder = [...prev];
        const targetIndex = direction === "up" ? index - 1 : index + 1;
        if (targetIndex < 0 || targetIndex >= prev.length) return prev;
        [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
        return newOrder;
        });
    };

// ---- update a field in a step (by uid) ----
    const updateItineraryStep = (uidToUpdate: string, changes: Partial<ItineraryFormData>) =>
        setItinerary(prev => prev.map(s => (s.uid === uidToUpdate ? { ...s, ...changes } : s)));

    const handleAddCategory = () => {
    // Ensure a speciality is selected and it's not already in the list
        if (categoryToAdd && !data.tour_categories.includes(Number(categoryToAdd))) {
            setEditTourData('tour_categories', [...data.tour_categories, Number(categoryToAdd)]);
            // Reset the dropdown
            setCategoryToAdd('');
        }
    };

    const handleRemoveCategory = (idToRemove: number) => {
        // Filter out the language with the matching ID
        const updatedCategories = data.tour_categories.filter((cateID) => cateID !== idToRemove);
        setEditTourData('tour_categories', updatedCategories);
    };

    const handleAddTag = () => {
    // Ensure a speciality is selected and it's not already in the list
        if (tagToAdd && !data.tour_tags.includes(Number(tagToAdd))) {
            setEditTourData('tour_tags', [...data.tour_tags, Number(tagToAdd)]);
            // Reset the dropdown
            setTagToAdd('');
        }
    };

    const handleRemoveTag = (idToRemove: number) => {
        // Filter out the language with the matching ID
        const updatedTags = data.tour_tags.filter((tagID) => tagID !== idToRemove);
        setEditTourData('tour_tags', updatedTags);
    };

    const handleAddItem = () => {
    // Ensure a speciality is selected and it's not already in the list
        if (itemToAdd && !data.tour_items.includes(Number(itemToAdd))) {
            setEditTourData('tour_items', [...data.tour_items, Number(itemToAdd)]);
            // Reset the dropdown
            setItemToAdd('');
        }
    };

    const handleRemoveItem = (idToRemove: number) => {
        // Filter out the language with the matching ID
        const updatedItems = data.tour_items.filter((itemID) => itemID !== idToRemove);
        setEditTourData('tour_items', updatedItems);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const filesArray = Array.from(files); // File[]
    const location_name = locations.find(l => l.id === data.tour_location_id);
    const added = Array.from(files).map((file, index) => ({
        file,
        preview: URL.createObjectURL(file),
        caption: `${location_name?.name}_${newImages.length + index + 1}`
    }));

    setNewImages((prev) => [...prev, ...added]);
    setEditTourData('tour_images', [...data.tour_images, ...filesArray]);

    // reset input so same file can be re-selected if needed
    (e.target as HTMLInputElement).value = '';
    };

    // Remove new image from local preview list
    const handleRemoveNew = (index: number) => {
        setNewImages(prev => {
            const removed = prev[index];
            if (removed) URL.revokeObjectURL(removed.preview);
            return prev.filter((_, i) => i !== index);
        });

        setEditTourData('tour_images', data.tour_images.filter((_, i) => i !== index));
    };


    const handleSubmit = (e: React.FormEvent) => {

        e.preventDefault();

        post(route('guide.create.tour.submit'), {
            onSuccess: () => {
            toast({
                title: "Tour Details Changed",
                description: "Tour details has been changed successfully",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: 'top',
            })
            }
        })

    };

    const cardBg = useColorModeValue('white', 'gray.800');
    const inputBg = useColorModeValue('gray.50', 'gray.700');
    const borderColor = useColorModeValue("gray.200", "gray.700");

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
                                    <Input value={data.name} onChange={(e) => setEditTourData('name', e.target.value)} bg={inputBg} />
                                </FormControl>
                                <FormControl isRequired>
                                    <FormLabel>Description</FormLabel>
                                    <Textarea value={data.tour_description} onChange={(e) => setEditTourData('tour_description', e.target.value)} bg={inputBg} rows={5} />
                                </FormControl>
                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">

                                    <FormControl isRequired>

                                        <FormLabel>Location</FormLabel>

                                        <InputGroup>
                                            <Select
                                            value={data.tour_location_id}
                                            placeholder='Pick a Location'
                                            onChange={(e) => setEditTourData('tour_location_id', Number(e.target.value))}
                                            bg={inputBg}
                                            >

                                            {locations.map((loc) => (
                                                <option key={loc.id} value={loc.id}>
                                                    {loc.name}
                                                </option>
                                            ))}
                                            </Select>

                                        </InputGroup>

                                    </FormControl>

                                    <FormControl isRequired>

                                        <FormLabel>Meeting Point</FormLabel>

                                        <InputGroup>
                                            <Select
                                            value={data.tour_meeting_point_id}
                                            placeholder='Pick a Meeting Point'
                                            onChange={(e) => setEditTourData('tour_meeting_point_id', Number(e.target.value))}
                                            bg={inputBg}
                                            >

                                            {meetingpoints.map((meet) => (
                                                <option key={meet.id} value={meet.id}>
                                                    {meet.name}
                                                </option>
                                            ))}
                                            </Select>

                                        </InputGroup>

                                    </FormControl>

                                </SimpleGrid>



                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">

                                    {/* Price */}
                                    <FormControl isRequired>
                                        <FormLabel>Price per Person (in IDR)</FormLabel>
                                        <NumberInput 
                                            min = {10000}
                                            max = {10000000}
                                            value={data.tour_price}
                                            bg={inputBg}
                                            onChange={(valueAsString, valueAsNumber) => setEditTourData('tour_price', valueAsNumber)}
                                        >
                                            <NumberInputField />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>

                                    {/* Duration */}
                                    <FormControl isRequired>
                                        <FormLabel>Tour Duration (in hours)</FormLabel>
                                        <NumberInput 
                                            min = {2}
                                            max = {24}
                                            value={data.tour_duration}
                                            bg={inputBg}
                                            onChange={(valueAsString, valueAsNumber) => setEditTourData('tour_duration', valueAsNumber)}
                                        >
                                            <NumberInputField />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>

                                </SimpleGrid>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">

                                    {/* Min participant */}
                                    <FormControl isRequired>
                                        <FormLabel>Minimum Amount of Participant (min: 1)</FormLabel>
                                        <NumberInput 
                                            min = {1}
                                            max = {data.tour_max_participants}
                                            value={data.tour_min_participants}
                                            bg={inputBg}
                                            onChange={(valueAsString, valueAsNumber) => setEditTourData('tour_min_participants', valueAsNumber)}
                                        >
                                            <NumberInputField />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>

                                    {/* Max Participant */}
                                    <FormControl isRequired>
                                        <FormLabel>Maximum Amount of Participant (max: 10)</FormLabel>
                                        <NumberInput 
                                            min = {data.tour_min_participants}
                                            max = {10}
                                            value={data.tour_max_participants}
                                            bg={inputBg}
                                            onChange={(valueAsString, valueAsNumber) => setEditTourData('tour_max_participants', valueAsNumber)}
                                        >
                                            <NumberInputField />
                                            <NumberInputStepper>
                                                <NumberIncrementStepper />
                                                <NumberDecrementStepper />
                                            </NumberInputStepper>
                                        </NumberInput>
                                    </FormControl>

                                </SimpleGrid>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">

                                    <FormControl isRequired>

                                        <FormLabel>Tour Period</FormLabel>

                                        <InputGroup>
                                            <Select
                                            value={data.tour_period_id}
                                            placeholder='Pick a Period'
                                            onChange={(e) => setEditTourData('tour_period_id', Number(e.target.value))}
                                            bg={inputBg}
                                            >

                                            {dayphases.map((day) => (
                                                <option key={day.id} value={day.id}>
                                                    {day.name} ({day.description})
                                                </option>
                                            ))}
                                            </Select>

                                        </InputGroup>

                                    </FormControl>

                                    <FormControl isRequired>

                                        <FormLabel>Tour Start Time</FormLabel>
                                        <Input value={data.tour_start_time} type='time' onChange={(e) => setEditTourData('tour_start_time', e.target.value)} bg={inputBg} />
                                    
                                    </FormControl>

                                </SimpleGrid>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">

                                    {/* Category */}
                                    <FormControl>

                                        <FormLabel>Category</FormLabel>
                                        <InputGroup>
                                            <Select
                                                placeholder="Choose a category to add..."
                                                value={categoryToAdd}
                                                onChange={(e) => setCategoryToAdd(Number(e.target.value))}
                                                bg={inputBg}
                                            >
                                                {categories
                                                    .filter(cat => !data.tour_categories.includes(cat.id))
                                                    .map((cat) => (
                                                        <option key={cat.id} value={cat.id}>
                                                            {cat.name}
                                                        </option>
                                                ))}
                                            </Select>

                                            <Button onClick={handleAddCategory} ml={2} isDisabled={!categoryToAdd}>
                                                Add
                                            </Button>

                                        </InputGroup>

                                        <HStack wrap="wrap" spacing={2} mb={4} marginTop={2}>
                                            {data.tour_categories.map((categoryId) => {
                                                const category = categories.find(c => c.id === categoryId);
                                                if (!category) return null;

                                                return (
                                                    <Tag key={category.id} size="lg" colorScheme="purple" borderRadius="full">
                                                        <TagLabel>{category.name}</TagLabel>
                                                        <TagCloseButton onClick={() => handleRemoveCategory(category.id)} />
                                                    </Tag>
                                                );
                                            })}
                                        </HStack>

                                    </FormControl>

                                    {/* Tags */}
                                    <FormControl>

                                        <FormLabel>Tags</FormLabel>
                                        <InputGroup>
                                            <Select
                                                placeholder="Choose a Tag to add..."
                                                value={tagToAdd}
                                                onChange={(e) => setTagToAdd(Number(e.target.value))}
                                                bg={inputBg}
                                            >
                                                {tags
                                                    .filter(tag => !data.tour_tags.includes(tag.id))
                                                    .map((tag) => (
                                                        <option key={tag.id} value={tag.id}>
                                                            {tag.name}
                                                        </option>
                                                ))}
                                            </Select>

                                            <Button onClick={handleAddTag} ml={2} isDisabled={!tagToAdd}>
                                                Add
                                            </Button>

                                        </InputGroup>

                                        <HStack wrap="wrap" spacing={2} mb={4} marginTop={2}>
                                            {data.tour_tags.map((tagId) => {
                                                const tag = tags.find(t => t.id === tagId);
                                                if (!tag) return null;

                                                return (
                                                    <Tag key={tag.id} size="lg" colorScheme="purple" borderRadius="full">
                                                        <TagLabel>{tag.name}</TagLabel>
                                                        <TagCloseButton onClick={() => handleRemoveTag(tag.id)} />
                                                    </Tag>
                                                );
                                            })}
                                        </HStack>

                                    </FormControl>

                                </SimpleGrid>                                

                            </VStack>
                        </Box>
                        
                        {/* Photo */}
                        <Box bg={useColorModeValue("white", "gray.800")} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>
                                Tour Photos
                            </Heading>

                            {/* Upload Box */}
                            <label htmlFor="image-upload">
                                <Flex
                                as="span"
                                border="2px dashed"
                                borderColor={useColorModeValue("gray.300", "gray.600")}
                                borderRadius="lg"
                                p={10}
                                align="center"
                                justify="center"
                                direction="column"
                                style={{
                                    cursor: !data.tour_location_id ? "not-allowed" : "pointer",
                                    opacity: !data.tour_location_id ? 0.5 : 1,
                                }}
                                _hover={{ borderColor: "blue.400" }}
                                >
                                <Icon as={FiUploadCloud} w={12} h={12} color="gray.500" />
                                <Text mt={4} color="gray.500">
                                    Click here to upload photos
                                </Text>
                                <Text fontSize="sm" color="gray.500">
                                    (Multiple images supported, Location Must be Filled first) 10MB Max.
                                </Text>
                                </Flex>
                            </label>

                            <input
                                id="image-upload"
                                type="file"
                                accept="image/*"
                                multiple
                                style={{ display: "none", cursor: !data.tour_location_id ? "not-allowed" : "pointer", opacity: !data.tour_location_id ? 0.5 : 1}}
                                disabled={!data.tour_location_id}
                                onChange= {(e) => {
                                    if (e.target.files) {
                                        setEditTourData("tour_images", Array.from(e.target.files));
                                    }
                                    handleFileChange(e);
                                }}
                            />

                            <Flex wrap="wrap" mt={4} gap={4}>
                                {/* Preview New Images */}
                                {newImages.map((img, index) => (
                                <Box key={index} position="relative">
                                    <Image src={img.preview} boxSize="100px" objectFit="cover" borderRadius="md" />
                                    <IconButton
                                    size="sm"
                                    icon={<FiX />}
                                    aria-label="Remove"
                                    position="absolute"
                                    top="0"
                                    right="0"
                                    onClick={() => handleRemoveNew(index)}
                                    />
                                    <Text mt={1} fontSize="sm" noOfLines={1}>
                                        {img.caption}
                                    </Text>
                                </Box>
                                ))}
                            </Flex>
                        </Box>

                        {/* Itinerary */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>Itinerary</Heading>
                            <VStack spacing={6} align="stretch">
                                {itinerary.map((step, index) => (
                                <Box
                                    key={step.uid}
                                    p={4}
                                    borderRadius="md"
                                    border="1px solid"
                                    borderColor= {borderColor}
                                >
                                    <VStack spacing={4} align="stretch">
                                        <HStack spacing={3}>
                                            <Flex justify="space-between" align="center">
                                                <Heading size="md">Step {step.step_number}</Heading>
                                                <IconButton
                                                icon={<FiTrash2 />}
                                                aria-label="Remove step"
                                                colorScheme="red"
                                                variant="ghost"
                                                onClick={() => handleRemoveItineraryStep(step.uid)}
                                                isDisabled={itinerary.length === 1}
                                                />
                                            </Flex>
                                            <IconButton
                                                icon={<FiArrowUp />}
                                                aria-label="Move up"
                                                size="sm"
                                                onClick={() => moveStep(index, "up")}
                                                isDisabled={index === 0}
                                            />
                                            <IconButton
                                                icon={<FiArrowDown />}
                                                aria-label="Move down"
                                                size="sm"
                                                onClick={() => moveStep(index, "down")}
                                                isDisabled={index === itinerary.length - 1}
                                            />
                                        </HStack>

                                        <HStack spacing={4}>
                                            <FormControl isRequired>
                                            <FormLabel fontSize="sm">Time</FormLabel>
                                            <Input
                                                placeholder="e.g., 09:00 AM"
                                                type='time'
                                                value={step.start_time}
                                                onChange={(e) =>
                                                updateItineraryStep(step.uid, { start_time: e.target.value })
                                                }
                                                bg={inputBg}
                                            />
                                            </FormControl>

                                            <FormControl isRequired>
                                            <FormLabel fontSize="sm">Activity Title</FormLabel>
                                            <Input
                                                placeholder="e.g., Visit Fatahillah Square"
                                                value={step.activity}
                                                onChange={(e) =>
                                                updateItineraryStep(step.uid, { activity: e.target.value })
                                                }
                                                bg={inputBg}
                                            />
                                            </FormControl>
                                        </HStack>

                                    <FormControl isRequired>
                                        <FormLabel fontSize="sm">Description</FormLabel>
                                        <Textarea
                                        placeholder="Describe the activity..."
                                        value={step.description}
                                        onChange={(e) =>
                                            updateItineraryStep(step.uid, { description: e.target.value })
                                        }
                                        bg={inputBg}
                                        />
                                    </FormControl>
                                    </VStack>
                                </Box>
                                ))}

                                <Button
                                leftIcon={<FiPlus />}
                                onClick={handleAddItineraryStep}
                                alignSelf="flex-start"
                                >
                                Add Step
                                </Button>
                            </VStack>
                        </Box>

                        {/* Items */}
                        <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
                            <Heading size="lg" mb={6}>What's Included & Excluded</Heading>

                            <FormControl mb={6}>
                                <FormLabel>Add an Included Item</FormLabel>
                                <InputGroup>
                                    <Select
                                        placeholder="Choose an item to include..."
                                        value={itemToAdd}
                                        onChange={(e) => setItemToAdd(Number(e.target.value))}
                                        bg={inputBg}
                                    >
                                        {availableItems.map((item) => (
                                            <option key={item.id} value={item.id}>
                                                {item.name}
                                            </option>
                                        ))}
                                    </Select>
                                    <Button onClick={handleAddItem} ml={2} isDisabled={!itemToAdd}>
                                        Add
                                    </Button>
                                </InputGroup>
                            </FormControl>

                            <SimpleGrid columns={{base: 1, md: 2}} spacing={6}>
                                <VStack align="stretch" spacing={3}>
                                    <Heading size="md" color="green.400">Included</Heading>
                                    {includedItems.map((item) => (
                                        <HStack key={item.id} bg={inputBg} p={2} borderRadius="md" justify="space-between">
                                            <Text>{item.name}</Text>
                                            <IconButton 
                                                icon={<FiTrash2 />} 
                                                aria-label="Remove Item" 
                                                onClick={() => handleRemoveItem(item.id)} 
                                                variant="ghost" 
                                                size="sm"
                                            />
                                        </HStack>
                                    ))}
                                    {includedItems.length === 0 && <Text color="gray.500" fontSize="sm">No included items added.</Text>}
                                </VStack>

                                <VStack align="stretch" spacing={3}>
                                    <Heading size="md" color="red.400">Excluded</Heading>
                                    {excludedItems.map((item) => (
                                        <HStack key={item.id} bg={inputBg} p={2} borderRadius="md" justify="space-between">
                                            <Text>{item.name}</Text>
                                        </HStack>
                                    ))}
                                    {excludedItems.length === 0 && <Text color="gray.500" fontSize="sm">All possible items are included.</Text>}
                                </VStack>
                            </SimpleGrid>
                        </Box>

                        <Flex justify="flex-end" gap={4} py={4}>
                             <Button variant="ghost" onClick={() => window.history.back()}>Cancel</Button>
                             <Button colorScheme="blue" type="submit">Save Changes</Button>
                        </Flex>

                    </VStack>
                </form>
            </Box>
        </GuideLayout>
    );
};