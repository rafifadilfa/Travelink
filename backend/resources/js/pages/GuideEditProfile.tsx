import React, { useState, useRef, useEffect } from 'react';
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
  Divider,
  Select,
} from '@chakra-ui/react';
import { FiSave, FiUser, FiGlobe, FiAward } from 'react-icons/fi';
import GuideLayout from '../layouts/GuideLayout';
import { useForm } from '@inertiajs/react';

// --- DATA TIRUAN (MOCK DATA) UNTUK PROFIL PEMANDU YANG SEDANG LOGIN ---

interface Language{
  id: number;
  name: string;
}

interface Speciality{
  id: number;
  name: string;
}

interface Guide{
  id: number;
  name: string;
  email: string;
  phone_number: number | '';
  profile_picture: string | null;
  about: string | null;
  languages: Language[] | null;
  specialities: Speciality[] | null;
}

interface Props{
  guide: Guide;
  languages: Language[];
  specialities: Speciality[];
}

export default function GuideEditProfile( { guide, languages, specialities }: Props ){
  const toast = useToast();

  const [languageToAdd, setLanguageToAdd] = useState<number | ''>('');
  const [specialityToAdd, setSpecialityToAdd] = useState<number | ''>('');

  const { data, setData: setProfileData, patch } = useForm({
    name: guide.name,
    email: guide.email,
    phone_number: guide.phone_number || '',
    about: guide.about || '',

    languages: guide.languages?.map(lang => lang.id) ?? [],
    specialities: guide.specialities?.map(spec => spec.id) ?? [],
  });

  const photoInput = useRef<HTMLInputElement>(null);
  const { data: photoData, setData: setPhotoData, post} = useForm({
      photo: null as File | null,
  });

  const cardBg = useColorModeValue('white', 'gray.800');
  const inputBg = useColorModeValue('gray.50', 'gray.700');


  const handleAddLanguage = () => {
    if (languageToAdd && !data.languages.includes(Number(languageToAdd))) {
        setProfileData('languages', [...data.languages, Number(languageToAdd)]);
        setLanguageToAdd('');
    }
  };

  const handleRemoveLanguage = (idToRemove: number) => {
    const updatedLanguages = data.languages.filter((langId) => langId !== idToRemove);
    setProfileData('languages', updatedLanguages);
  };

  const availableLanguages = languages.filter(
    (lang) => !data.languages.includes(lang.id)
  );

  const handleAddSpeciality = () => {
    if (specialityToAdd && !data.specialities.includes(Number(specialityToAdd))) {
        setProfileData('specialities', [...data.specialities, Number(specialityToAdd)]);
        setSpecialityToAdd('');
    }
  };

  const handleRemoveSpeciality = (idToRemove: number) => {
    const updatedSpecialties = data.specialities.filter((specid) => specid !== idToRemove);
    setProfileData('specialities', updatedSpecialties);
  };

  const availableSpeciality = specialities.filter(
    (spec) => !data.specialities.includes(spec.id)
  );

  const handleSaveChanges = (e: React.FormEvent) => {

    e.preventDefault();

    patch(route('guide.profile.update'), {
      onSuccess: () => {
        toast({
          title: "Profile Saved!",
          description: "Your profile information has been successfully updated.",
          status: "success",
          duration: 5000,
          isClosable: true,
          position: 'top',
        })
      }
    })

  };

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const photo = e.target.files[0];
      setPhotoData('photo', photo);
    }
  }

  useEffect(() => {
    if (photoData.photo) {
      post(route('guide.profile.photo.update'), {
        onSuccess: () => {
            toast({
                title: "Photo Updated",
                description: "Your profile photo has been successfully updated.",
                status: "success",
                duration: 4000,
                isClosable: true,
            });
        },

        onError: (errors) => {
            console.error(errors);
        }
      });
    }
  }, [photoData.photo, toast, post]);

  const selectNewPhoto = () => {
    photoInput.current?.click();
  };

  return (
    <GuideLayout>
      <Box maxW="container.lg" mx="auto">
        <Heading as="h1" size="xl" mb={8}>
          Manage Your Profile
        </Heading>

        <form onSubmit={handleSaveChanges}>

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
                    <Avatar size="lg" name={data.name} src={guide.profile_picture ? `/storage/${guide.profile_picture}` : `https://ui-avatars.com/api/?name=${guide.name}`} />
                    
                    <input
                    type="file"
                    style={{ display: "none"}}
                    ref={photoInput}
                    onChange={handlePhotoChange}
                    accept="image/*"
                    />
                    
                    <Button size="sm" onClick={selectNewPhoto}>Change Picture</Button>
                  
                  </HStack>
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Full Name</FormLabel>
                  <Input
                    value={data.name}
                    onChange={(e) => setProfileData('name', e.target.value)}
                    bg={inputBg}
                    placeholder="Enter your full name"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Email Address</FormLabel>
                  <Input
                    value={data.email}
                    isReadOnly
                    bg={useColorModeValue('gray.200', 'gray.800')}
                    cursor="not-allowed"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>About Me</FormLabel>
                  <Textarea
                    value={data.about}
                    onChange={(e) => setProfileData('about', e.target.value)}
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
                <Box>
                  <Heading size="lg" mb={4} display="flex" alignItems="center"><Icon as={FiGlobe} mr={3} /> Languages</Heading>
                  <HStack wrap="wrap" spacing={2} mb={4}>
                    {data.languages.map((langId) => {
                        const language = languages.find(l => l.id === langId);
                        if (!language) return null;

                        return (
                            <Tag key={language.id} size="lg" colorScheme="blue" borderRadius="full">
                                <TagLabel>{language.name}</TagLabel>
                                <TagCloseButton onClick={() => handleRemoveLanguage(language.id)} />
                            </Tag>
                        );
                    })}
                  </HStack>

                  <InputGroup>
                    <Select
                      placeholder="Choose a language..."
                      value={languageToAdd}
                      onChange={(e) => setLanguageToAdd(Number(e.target.value))}
                    >
                      {availableLanguages.map((lang) => (
                          <option key={lang.id} value={lang.id}>
                              {lang.name}
                          </option>
                      ))}
                    </Select>

                    <Button onClick={handleAddLanguage} ml={2}>Add</Button>

                  </InputGroup>

                </Box>

                <Divider />

                {/* Specialties */}
                <Box>
                  <Heading size="lg" mb={4} display="flex" alignItems="center"><Icon as={FiAward} mr={3} /> Specialties</Heading>
                  <HStack wrap="wrap" spacing={2} mb={4}>
                    {data.specialities.map((specid) => {
                        // Find the full language object from the ID
                        const speciality = specialities.find(s => s.id === specid);
                        if (!speciality) return null; // Or some fallback UI

                        return (
                            <Tag key={speciality.id} size="lg" colorScheme="blue" borderRadius="full">
                                <TagLabel>{speciality.name}</TagLabel>
                                <TagCloseButton onClick={() => handleRemoveSpeciality(speciality.id)} />
                            </Tag>
                        );
                    })}
                  </HStack>

                  <InputGroup>
                    <Select
                      placeholder="Choose a speciality..."
                      value={specialityToAdd}
                      onChange={(e) => setSpecialityToAdd(Number(e.target.value))}
                    >
                      {availableSpeciality.map((spec) => (
                          <option key={spec.id} value={spec.id}>
                              {spec.name}
                          </option>
                      ))}
                    </Select>

                    <Button onClick={handleAddSpeciality} ml={2}>Add</Button>

                  </InputGroup>
                </Box>
              </VStack>
            </Box>

            <Flex justify="flex-end" py={4}>
              <Button
                colorScheme="blue"
                leftIcon={<FiSave />}
                type= "submit"
              >
                Save Changes
              </Button>
            </Flex>
          </VStack>
        </form>
      </Box>
    </GuideLayout>
  );
};