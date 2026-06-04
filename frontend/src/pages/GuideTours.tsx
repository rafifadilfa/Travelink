import React, { useState, useEffect, useRef } from 'react';
import {
  Box, Flex, Text, Heading, useColorModeValue, VStack, HStack,
  Button, IconButton, Tag, AlertDialog, AlertDialogBody,
  AlertDialogFooter, AlertDialogHeader, AlertDialogContent,
  AlertDialogOverlay, useToast, Spinner, Image,
} from '@chakra-ui/react';
import { FiPlus, FiEdit, FiTrash2, FiStar, FiUsers, FiCalendar } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

interface Tour {
  id: number;
  name: string;
  status: string;
  type: string;
  price: number;
  duration: number;
  rating: number;
  review_count: number;
  booking_count: number;
  first_image_url: string | null;
  availability_days: number[];
  location: { id: number; name: string } | null;
}

const STATUS_LABEL: Record<string, { label: string; color: string }> = {
  published: { label: 'Aktif',    color: 'green'  },
  draft:     { label: 'Draft',    color: 'yellow' },
  inactive:  { label: 'Nonaktif', color: 'gray'   },
};

const DAY_LABELS = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];

const GuideTours: React.FC = () => {
  const navigate   = useNavigate();
  const toast      = useToast();
  const cancelRef  = useRef<HTMLButtonElement>(null);
  const cardBg     = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const secondary  = useColorModeValue('gray.500', 'gray.400');

  const [tours, setTours]             = useState<Tour[]>([]);
  const [loading, setLoading]         = useState(true);
  const [deleteId, setDeleteId]       = useState<number | null>(null);
  const [isDeleting, setIsDeleting]   = useState(false);

  useEffect(() => {
    guideApiClient.get('/guide/tours')
      .then(res => setTours(res.data.tours))
      .catch(() => toast({ title: 'Gagal memuat paket wisata', status: 'error', duration: 4000, isClosable: true }))
      .finally(() => setLoading(false));
  }, []);

  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await guideApiClient.delete(`/guide/tours/${deleteId}`);
      setTours(prev => prev.filter(t => t.id !== deleteId));
      toast({ title: 'Paket wisata berhasil dihapus.', status: 'success', duration: 3000, isClosable: true });
    } catch (err: any) {
      const msg = err.response?.data?.message ?? 'Gagal menghapus. Coba lagi.';
      toast({ title: 'Gagal menghapus', description: msg, status: 'error', duration: 5000, isClosable: true });
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  return (
    <GuideLayout>
      <Box maxW="container.lg" mx="auto">
        <Flex justifyContent="space-between" alignItems="center" mb={8}
          direction={{ base: 'column', md: 'row' }} gap={4}>
          <Box>
            <Heading as="h1" size="xl">Paket Wisata Saya</Heading>
            <Text color={secondary} mt={1}>Kelola, edit, dan buat paket wisata Anda.</Text>
          </Box>
          <Button leftIcon={<FiPlus />} colorScheme="blue" onClick={() => navigate('/guide/tours/new')}>
            Buat Paket Baru
          </Button>
        </Flex>

        {loading ? (
          <Flex justify="center" py={20}><Spinner size="xl" color="blue.400" /></Flex>
        ) : tours.length === 0 ? (
          <Box textAlign="center" py={20} color={secondary}>
            <Text fontSize="lg">Anda belum memiliki paket wisata.</Text>
            <Button mt={4} colorScheme="blue" leftIcon={<FiPlus />} onClick={() => navigate('/guide/tours/new')}>
              Buat Paket Pertama Anda
            </Button>
          </Box>
        ) : (
          <VStack spacing={5} align="stretch">
            {tours.map(tour => {
              const st = STATUS_LABEL[tour.status] ?? { label: tour.status, color: 'gray' };
              return (
                <Flex key={tour.id} p={5} bg={cardBg} borderRadius="lg" boxShadow="md"
                  border="1px solid" borderColor={borderColor} gap={4} flexWrap="wrap"
                  transition="all 0.2s" _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }}>

                  {/* Foto */}
                  {tour.first_image_url && (
                    <Image
                      src={tour.first_image_url} alt={tour.name}
                      boxSize="80px" objectFit="cover" borderRadius="md" flexShrink={0}
                    />
                  )}

                  {/* Info */}
                  <VStack align="flex-start" flex={1} minW="200px" spacing={1}>
                    <Heading size="md" noOfLines={1}>{tour.name}</Heading>
                    <HStack flexWrap="wrap" gap={2}>
                      <Tag size="sm" colorScheme={st.color}>{st.label}</Tag>
                      <Tag size="sm" variant="outline">{tour.type === 'regular' ? 'Reguler' : 'Open Trip'}</Tag>
                      {tour.location && <Text fontSize="xs" color={secondary}>{tour.location.name}</Text>}
                    </HStack>
                    <HStack spacing={4} color={secondary} fontSize="sm" flexWrap="wrap">
                      <HStack spacing={1}><FiStar /><Text>{tour.rating?.toFixed(1) ?? '–'}</Text></HStack>
                      <HStack spacing={1}><FiUsers /><Text>{tour.booking_count} pesanan</Text></HStack>
                      <HStack spacing={1}><FiCalendar /><Text>{tour.duration} jam</Text></HStack>
                    </HStack>
                    {tour.availability_days.length > 0 && (
                      <HStack spacing={1} flexWrap="wrap">
                        {tour.availability_days.map(d => (
                          <Tag key={d} size="xs" colorScheme="blue" variant="subtle">{DAY_LABELS[d]}</Tag>
                        ))}
                      </HStack>
                    )}
                  </VStack>

                  {/* Harga + Aksi */}
                  <Flex direction="column" align="flex-end" justify="space-between" minW="120px">
                    <Text fontWeight="bold" fontSize="lg" color="blue.500">
                      Rp {tour.price?.toLocaleString('id-ID')}
                    </Text>
                    <HStack spacing={1} mt={2}>
                      <IconButton icon={<FiEdit />} aria-label="Edit" variant="ghost" colorScheme="blue"
                        onClick={() => navigate(`/guide/tours/edit/${tour.id}`)} />
                      <IconButton icon={<FiTrash2 />} aria-label="Hapus" variant="ghost" colorScheme="red"
                        onClick={() => setDeleteId(tour.id)} />
                    </HStack>
                  </Flex>
                </Flex>
              );
            })}
          </VStack>
        )}
      </Box>

      {/* Dialog konfirmasi hapus */}
      <AlertDialog isOpen={!!deleteId} leastDestructiveRef={cancelRef as any}
        onClose={() => setDeleteId(null)}>
        <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader>Hapus Paket Wisata</AlertDialogHeader>
            <AlertDialogBody>
              Yakin ingin menghapus paket ini? Jika masih ada pesanan aktif, penghapusan akan ditolak.
            </AlertDialogBody>
            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={() => setDeleteId(null)}>Batal</Button>
              <Button colorScheme="red" isLoading={isDeleting} onClick={confirmDelete} ml={3}>
                Hapus
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </GuideLayout>
  );
};

export default GuideTours;
