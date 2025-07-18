import React, { useState } from 'react';
import {
  Box,
  Flex,
  Heading,
  useColorModeValue,
  VStack,
  HStack,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Avatar,
  useToast,
  Icon,
  Tag,
  TagLabel,
  TagCloseButton,
  InputGroup,
  InputRightElement,
  Divider // <-- Divider sudah ditambahkan di sini
} from '@chakra-ui/react';
import { FiSave, FiUser, FiGlobe, FiAward, FiPlus } from 'react-icons/fi';
import GuideLayout from '../components/GuideLayout';

// --- DATA TIRUAN (MOCK DATA) UNTUK PROFIL PEMANDU YANG SEDANG LOGIN ---
const initialGuideData = {
  name: "Budi Hartono",
  avatar: "https://randomuser.me/api/portraits/men/32.jpg",
  email: "budi.hartono@travelink.com",
  about: "Saya adalah seorang pemandu wisata profesional dengan pengalaman lebih dari 5 tahun di Jakarta. Saya suka berbagi cerita tentang sejarah kota ini dan menunjukkan tempat-tempat tersembunyi yang menarik.",
  languages: ['Indonesian', 'English'],
  specialties: ['Sejarah', 'Kuliner', 'Wisata Kota'],
  isVerified: true,
};

// --- KOMPONEN UTAMA ---
const GuideEditProfile: React.FC = () => {
  const toast = useToast();

  // State untuk menyimpan data form
  const [name, setName] = useState(initialGuideData.name);
  const [about, setAbout] = useState(initialGuideData.about);
  const [languages, setLanguages] = useState(initialGuideData.languages);
  const [specialties, setSpecialties] = useState(initialGuideData.specialties);
  const [newLanguage, setNewLanguage] = useState('');
  const [newSpecialty, setNewSpecialty] = useState('');

  const cardBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.700');

  // Fungsi untuk menangani penambahan item (bahasa/spesialisasi)
  const handleAddItem = (type: 'language' | 'specialty') => {
    if (type === 'language' && newLanguage.trim() !== '') {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage('');
    } else if (type === 'specialty' && newSpecialty.trim() !== '') {
      setSpecialties([...specialties, newSpecialty.trim()]);
      setNewSpecialty('');
    }
  };

  // Fungsi untuk menghapus item
  const handleRemoveItem = (type: 'language' | 'specialty', index: number) => {
    if (type === 'language') {
      const updatedLanguages = [...languages];
      updatedLanguages.splice(index, 1);
      setLanguages(updatedLanguages);
    } else if (type === 'specialty') {
      const updatedSpecialties = [...specialties];
      updatedSpecialties.splice(index, 1);
      setSpecialties(updatedSpecialties);
    }
  };

  // Fungsi untuk menyimpan perubahan
  const handleSaveChanges = () => {
    const updatedData = { name, about, languages, specialties };
    console.log("Profile updated:", updatedData);
    toast({
      title: "Profile Saved!",
      description: "Your profile information has been successfully updated.",
      status: "success",
      duration: 5000,
      isClosable: true,
      position: 'top',
    });
  };

  return (
    <GuideLayout>
      <Box maxW="container.lg" mx="auto">
        <Heading as="h1" size="xl" mb={8}>
          Manage Your Profile
        </Heading>

        <VStack spacing={8} align="stretch">
          {/* Personal Information Section */}
          <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
            <Heading size="lg" mb={6} display="flex" alignItems="center">
              <Icon as={FiUser} mr={3} /> Personal Information
            </Heading>
            <VStack spacing={5}>
              <FormControl>
                <FormLabel>Profile Picture</FormLabel>
                <HStack spacing={4}>
                  <Avatar size="lg" name={name} src={initialGuideData.avatar} />
                  <Button size="sm">Change Picture</Button>
                </HStack>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Full Name</FormLabel>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  bg={inputBg}
                  placeholder="Enter your full name"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Email Address</FormLabel>
                <Input
                  value={initialGuideData.email}
                  isReadOnly
                  bg={useColorModeValue('gray.200', 'gray.800')}
                  cursor="not-allowed"
                />
              </FormControl>

              <FormControl isRequired>
                <FormLabel>About Me</FormLabel>
                <Textarea
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                  bg={inputBg}
                  placeholder="Tell tourists a little about yourself"
                  rows={5}
                />
              </FormControl>
            </VStack>
          </Box>

          {/* Skills & Specialties Section */}
          <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
            <VStack spacing={6} align="stretch">
              {/* Languages */}
              <Box>
                <Heading size="lg" mb={4} display="flex" alignItems="center"><Icon as={FiGlobe} mr={3} /> Languages</Heading>
                <HStack wrap="wrap" spacing={2} mb={4}>
                  {languages.map((lang, index) => (
                    <Tag key={index} size="lg" colorScheme="blue" borderRadius="full">
                      <TagLabel>{lang}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveItem('language', index)} />
                    </Tag>
                  ))}
                </HStack>
                <InputGroup>
                  <Input value={newLanguage} onChange={(e) => setNewLanguage(e.target.value)} placeholder="Add a new language" bg={inputBg} />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={() => handleAddItem('language')} leftIcon={<FiPlus />}>Add</Button>
                  </InputRightElement>
                </InputGroup>
              </Box>

              <Divider />

              {/* Specialties */}
              <Box>
                <Heading size="lg" mb={4} display="flex" alignItems="center"><Icon as={FiAward} mr={3} /> Specialties</Heading>
                <HStack wrap="wrap" spacing={2} mb={4}>
                  {specialties.map((spec, index) => (
                    <Tag key={index} size="lg" colorScheme="green" borderRadius="full">
                      <TagLabel>{spec}</TagLabel>
                      <TagCloseButton onClick={() => handleRemoveItem('specialty', index)} />
                    </Tag>
                  ))}
                </HStack>
                <InputGroup>
                  <Input value={newSpecialty} onChange={(e) => setNewSpecialty(e.target.value)} placeholder="e.g., Photography, Hiking" bg={inputBg} />
                  <InputRightElement width="4.5rem">
                    <Button h="1.75rem" size="sm" onClick={() => handleAddItem('specialty')} leftIcon={<FiPlus />}>Add</Button>
                  </InputRightElement>
                </InputGroup>
              </Box>
            </VStack>
          </Box>

          {/* Form Actions */}
          <Flex justify="flex-end" py={4}>
            <Button
              colorScheme="blue"
              leftIcon={<FiSave />}
              onClick={handleSaveChanges}
            >
              Save Changes
            </Button>
          </Flex>
        </VStack>
      </Box>
    </GuideLayout>
  );
};

export default GuideEditProfile;