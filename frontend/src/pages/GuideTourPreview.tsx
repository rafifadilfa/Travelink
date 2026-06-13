import React, { useEffect, useState } from 'react';
import {
  Alert, AlertIcon, Badge, Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink,
  Button, Divider, Flex, Heading, HStack, Icon, Image, SimpleGrid,
  Spinner, Tab, TabList, TabPanel, TabPanels, Tabs, Text,
  useColorModeValue, VStack, Wrap, WrapItem,
} from '@chakra-ui/react';
import {
  FiArrowLeft, FiCalendar, FiClock, FiEdit, FiEye,
  FiMapPin, FiTag, FiUsers,
} from 'react-icons/fi';
import { useNavigate, useParams } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

// ── Data shape dari GET /api/guide/tours/{id} ──────────────────────────────────
interface GuideTourPreviewData {
  id: number;
  title: string;
  description: string | null;
  location: string;
  category: string;
  price: string;
  duration: string;
  status: 'draft' | 'published';
  is_open_trip: boolean;
  available_days: number[];
  itinerary: { time: string; activity: string }[];
  included: string[];
  excluded: string[];
  images: { id: number; url: string }[];
}

const DAY_LABELS: Record<number, string> = {
  0: 'Minggu', 1: 'Senin', 2: 'Selasa', 3: 'Rabu',
  4: 'Kamis',  5: 'Jumat', 6: 'Sabtu',
};

const fmtPrice = (s: string) =>
  'Rp ' + parseInt(s, 10).toLocaleString('id-ID');

// ── Komponen info card kecil ───────────────────────────────────────────────────
const InfoCard = ({ icon, label, value }: { icon: React.ElementType; label: string; value: string }) => {
  const cardBg = useColorModeValue('gray.50', 'gray.700');
  const sub    = useColorModeValue('gray.500', 'gray.400');
  return (
    <Box bg={cardBg} borderRadius="lg" p={4}>
      <HStack spacing={2} mb={1}>
        <Icon as={icon} color="blue.400" />
        <Text fontSize="xs" color={sub} fontWeight="medium" textTransform="uppercase" letterSpacing="wide">
          {label}
        </Text>
      </HStack>
      <Text fontWeight="semibold" fontSize="sm">{value || '—'}</Text>
    </Box>
  );
};

// ── Halaman utama ──────────────────────────────────────────────────────────────
const GuideTourPreview: React.FC = () => {
  const { id }     = useParams<{ id: string }>();
  const navigate   = useNavigate();
  const secondary  = useColorModeValue('gray.500', 'gray.400');
  const cardBg     = useColorModeValue('white', 'gray.800');
  const border     = useColorModeValue('gray.200', 'gray.700');
  const thumbBg    = useColorModeValue('gray.100', 'gray.700');

  const [tour,         setTour]         = useState<GuideTourPreviewData | null>(null);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState(false);
  const [activeImage,  setActiveImage]  = useState(0);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    guideApiClient.get(`/guide/tours/${id}`)
      .then(res => setTour(res.data.tour))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <GuideLayout>
        <Flex justify="center" align="center" h="60vh">
          <Spinner size="xl" color="blue.400" />
        </Flex>
      </GuideLayout>
    );
  }

  if (error || !tour) {
    return (
      <GuideLayout>
        <Flex direction="column" align="center" justify="center" h="60vh" gap={4}>
          <Text fontSize="lg" color={secondary}>Paket wisata tidak ditemukan.</Text>
          <Button leftIcon={<FiArrowLeft />} onClick={() => navigate('/guide/tours')}>
            Kembali ke My Tours
          </Button>
        </Flex>
      </GuideLayout>
    );
  }

  const includedItems = tour.included.filter(Boolean);
  const excludedItems = tour.excluded.filter(Boolean);
  const hasImages     = tour.images.length > 0;

  return (
    <GuideLayout>
      <Box maxW="container.lg" mx="auto">
        {/* Breadcrumb */}
        <Breadcrumb separator="›" mb={4} fontSize="sm" color={secondary}>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/guide/dashboard')}>Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => navigate('/guide/tours')}>My Tours</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink color="blue.500" fontWeight="medium">Preview Tour</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Banner mode preview */}
        <Alert status="info" borderRadius="lg" mb={6}>
          <AlertIcon as={FiEye} />
          <Text fontSize="sm">
            <Text as="span" fontWeight="bold">Mode Preview — </Text>
            Begini tampilan paket wisata Anda seperti yang dilihat oleh wisatawan.
          </Text>
        </Alert>

        {/* Header: judul + badge + aksi */}
        <Flex justify="space-between" align="flex-start" wrap="wrap" gap={4} mb={6}>
          <Box flex="1">
            <HStack spacing={3} mb={1} flexWrap="wrap">
              <Heading as="h1" size="xl">{tour.title}</Heading>
              <Badge
                colorScheme={tour.status === 'published' ? 'green' : 'gray'}
                fontSize="sm" borderRadius="full" px={3} py={1}
              >
                {tour.status === 'published' ? 'Diterbitkan' : 'Draft'}
              </Badge>
              {tour.is_open_trip && (
                <Badge colorScheme="purple" fontSize="sm" borderRadius="full" px={3} py={1}>
                  Smart Open Trip
                </Badge>
              )}
            </HStack>
            <Text fontSize="2xl" fontWeight="bold" color="blue.500">{fmtPrice(tour.price)}</Text>
          </Box>
          <HStack spacing={3} flexShrink={0}>
            <Button
              variant="outline" leftIcon={<FiArrowLeft />}
              onClick={() => navigate('/guide/tours')}
            >
              My Tours
            </Button>
            <Button
              colorScheme="blue" leftIcon={<FiEdit />}
              onClick={() => navigate(`/guide/tours/edit/${tour.id}`)}
            >
              Edit Tour
            </Button>
          </HStack>
        </Flex>

        {/* Galeri gambar */}
        {hasImages ? (
          <Box mb={8}>
            <Box
              borderRadius="xl" overflow="hidden" mb={3}
              h={{ base: '220px', md: '380px' }} bg={thumbBg}
            >
              <Image
                src={tour.images[activeImage].url}
                alt={tour.title}
                w="100%" h="100%" objectFit="cover"
              />
            </Box>
            {tour.images.length > 1 && (
              <HStack spacing={2} overflowX="auto" pb={1}>
                {tour.images.map((img, idx) => (
                  <Box
                    key={img.id} flexShrink={0}
                    w="72px" h="72px" borderRadius="lg" overflow="hidden"
                    border="2px solid"
                    borderColor={idx === activeImage ? 'blue.400' : 'transparent'}
                    cursor="pointer"
                    onClick={() => setActiveImage(idx)}
                    opacity={idx === activeImage ? 1 : 0.65}
                    transition="all 0.2s"
                    _hover={{ opacity: 1 }}
                  >
                    <Image src={img.url} alt="" w="100%" h="100%" objectFit="cover" />
                  </Box>
                ))}
              </HStack>
            )}
          </Box>
        ) : (
          <Flex
            h="220px" borderRadius="xl" bg={thumbBg} mb={8}
            align="center" justify="center" direction="column" gap={2}
          >
            <Icon as={FiEye} boxSize={10} color={secondary} />
            <Text fontSize="sm" color={secondary}>Belum ada foto paket wisata</Text>
          </Flex>
        )}

        {/* Grid info utama */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4} mb={6}>
          <InfoCard icon={FiTag}      label="Harga"    value={fmtPrice(tour.price)} />
          <InfoCard icon={FiClock}    label="Durasi"   value={tour.duration} />
          <InfoCard icon={FiMapPin}   label="Lokasi"   value={tour.location} />
          <InfoCard icon={FiUsers}    label="Kategori" value={tour.category} />
        </SimpleGrid>

        {/* Hari tersedia */}
        {tour.available_days.length > 0 && (
          <Box
            bg={cardBg} border="1px solid" borderColor={border}
            borderRadius="lg" p={4} mb={6}
          >
            <HStack spacing={2} mb={3}>
              <Icon as={FiCalendar} color="blue.400" />
              <Text fontWeight="semibold" fontSize="sm">Hari Tersedia</Text>
            </HStack>
            <Wrap spacing={2}>
              {[...tour.available_days].sort().map(day => (
                <WrapItem key={day}>
                  <Badge colorScheme="blue" borderRadius="full" px={3} py={1}>
                    {DAY_LABELS[day] ?? day}
                  </Badge>
                </WrapItem>
              ))}
            </Wrap>
          </Box>
        )}

        <Divider mb={6} />

        {/* Tab konten */}
        <Tabs variant="soft-rounded" colorScheme="blue">
          <TabList mb={4} flexWrap="wrap" gap={2}>
            <Tab>Deskripsi</Tab>
            <Tab>Itinerary</Tab>
            <Tab>Fasilitas</Tab>
          </TabList>

          <TabPanels>
            {/* Tab Deskripsi */}
            <TabPanel p={0}>
              <Box
                bg={cardBg} border="1px solid" borderColor={border}
                borderRadius="lg" p={6}
              >
                {tour.description ? (
                  <Text whiteSpace="pre-wrap" lineHeight="tall">{tour.description}</Text>
                ) : (
                  <Text color={secondary} fontStyle="italic">Belum ada deskripsi.</Text>
                )}
              </Box>
            </TabPanel>

            {/* Tab Itinerary */}
            <TabPanel p={0}>
              <Box
                bg={cardBg} border="1px solid" borderColor={border}
                borderRadius="lg" p={6}
              >
                {tour.itinerary.length === 0 ? (
                  <Text color={secondary} fontStyle="italic">Belum ada itinerary.</Text>
                ) : (
                  <VStack align="stretch" spacing={4}>
                    {tour.itinerary.map((item, idx) => (
                      <HStack key={idx} align="flex-start" spacing={4}>
                        <Box
                          minW="80px" textAlign="center" bg="blue.50"
                          borderRadius="md" px={2} py={1}
                          color="blue.600" fontSize="sm" fontWeight="bold"
                          flexShrink={0}
                        >
                          {item.time || '—'}
                        </Box>
                        <Text fontSize="sm" pt={1}>{item.activity}</Text>
                      </HStack>
                    ))}
                  </VStack>
                )}
              </Box>
            </TabPanel>

            {/* Tab Fasilitas */}
            <TabPanel p={0}>
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                {/* Termasuk */}
                <Box
                  bg={cardBg} border="1px solid" borderColor={border}
                  borderRadius="lg" p={5}
                >
                  <Text fontWeight="bold" mb={3} color="green.600">Termasuk</Text>
                  {includedItems.length === 0 ? (
                    <Text fontSize="sm" color={secondary} fontStyle="italic">Tidak ada</Text>
                  ) : (
                    <VStack align="stretch" spacing={2}>
                      {includedItems.map((item, idx) => (
                        <HStack key={idx} spacing={2}>
                          <Box w={2} h={2} borderRadius="full" bg="green.400" flexShrink={0} />
                          <Text fontSize="sm">{item}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Box>

                {/* Tidak termasuk */}
                <Box
                  bg={cardBg} border="1px solid" borderColor={border}
                  borderRadius="lg" p={5}
                >
                  <Text fontWeight="bold" mb={3} color="red.500">Tidak Termasuk</Text>
                  {excludedItems.length === 0 ? (
                    <Text fontSize="sm" color={secondary} fontStyle="italic">Tidak ada</Text>
                  ) : (
                    <VStack align="stretch" spacing={2}>
                      {excludedItems.map((item, idx) => (
                        <HStack key={idx} spacing={2}>
                          <Box w={2} h={2} borderRadius="full" bg="red.400" flexShrink={0} />
                          <Text fontSize="sm">{item}</Text>
                        </HStack>
                      ))}
                    </VStack>
                  )}
                </Box>
              </SimpleGrid>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </GuideLayout>
  );
};

export default GuideTourPreview;
