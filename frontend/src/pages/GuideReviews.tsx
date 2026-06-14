import React, { useState, useEffect } from 'react';
import {
  Box, Flex, Text, Heading, useColorModeValue, VStack, HStack,
  Avatar, Spinner, Select, SimpleGrid, Progress, Badge,
  Breadcrumb, BreadcrumbItem, BreadcrumbLink,
} from '@chakra-ui/react';
import { FiStar } from 'react-icons/fi';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { guideApiClient } from '../services/api';

interface ReviewUser { id: number; name: string; avatar_url: string | null; }
interface Review {
  id: string;
  type: 'guide' | 'tour';
  rating: number;
  comment: string | null;
  tour_name: string | null;
  created_at: string;
  user: ReviewUser | null;
}
interface Summary {
  average_rating: number; total_reviews: number;
  distribution: Record<number, number>;
}

const Stars = ({ rating }: { rating: number }) => {
  const rounded = Math.round(rating * 2) / 2;
  return (
    <HStack spacing={0.5}>
      {[1,2,3,4,5].map(i => {
        let icon;
        if (i <= Math.floor(rounded)) icon = FaStar;
        else if (i === Math.ceil(rounded) && rounded % 1 !== 0) icon = FaStarHalfAlt;
        else icon = FaRegStar;
        return <Box key={i} as={icon} color="yellow.400" fontSize="sm" />;
      })}
    </HStack>
  );
};

const GuideReviews: React.FC = () => {
  const navigate  = useNavigate();
  const secondary = useColorModeValue('gray.500', 'gray.400');
  const cardBg    = useColorModeValue('white', 'gray.800');
  const border    = useColorModeValue('gray.200', 'gray.700');

  const guideRaw   = localStorage.getItem('guide');
  const guide      = guideRaw ? JSON.parse(guideRaw) : null;
  const isVerified = guide?.verification_status === 'verified';

  useEffect(() => {
    if (!isVerified) navigate('/guide/dashboard');
  }, []);

  const [summary,  setSummary]  = useState<Summary | null>(null);
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [rating,   setRating]   = useState('');
  const [period,   setPeriod]   = useState('');

  const fetch = () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (rating) params.set('rating', rating);
    if (period) params.set('period', period);
    guideApiClient.get(`/guide/reviews?${params}`)
      .then(res => {
        setSummary(res.data.summary);
        setReviews(res.data.data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetch(); }, [rating, period]);

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('id-ID', { day:'numeric', month:'long', year:'numeric' });

  if (!isVerified) {
    return <Flex justify="center" align="center" h="60vh"><Spinner size="xl" color="blue.400" /></Flex>;
  }

  return (
    <GuideLayout>
      <Box maxW="container.lg" mx="auto">
        <Breadcrumb separator="›" mb={4} fontSize="sm" color={secondary}>
          <BreadcrumbItem><BreadcrumbLink onClick={() => navigate('/guide/dashboard')}>Dashboard</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbItem isCurrentPage><BreadcrumbLink color="blue.500" fontWeight="medium">Ulasan & Rating</BreadcrumbLink></BreadcrumbItem>
        </Breadcrumb>
        <Heading as="h1" size="xl" mb={2}>Ulasan & Rating</Heading>
        <Text color={secondary} mb={6}>Lihat feedback wisatawan tentang Anda.</Text>

        {/* Ringkasan */}
        {summary && (
          <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6} mb={8}>
            {/* Rata-rata */}
            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md" textAlign="center">
              <Text fontSize={{ base: '4xl', md: '5xl' }} fontWeight="bold" color="blue.500">
                {summary.average_rating.toFixed(1)}
              </Text>
              <Stars rating={summary.average_rating} />
              <Text mt={2} color={secondary}>{summary.total_reviews} ulasan</Text>
            </Box>

            {/* Distribusi */}
            <Box bg={cardBg} p={6} borderRadius="lg" boxShadow="md">
              <VStack align="stretch" spacing={2}>
                {[5,4,3,2,1].map(star => {
                  const count = summary.distribution[star] ?? 0;
                  const pct   = summary.total_reviews > 0 ? (count / summary.total_reviews) * 100 : 0;
                  return (
                    <HStack key={star} spacing={3}>
                      <Text fontSize="sm" w="8px">{star}</Text>
                      <Box as={FiStar} color="yellow.400" flexShrink={0} />
                      <Progress value={pct} flex={1} colorScheme="yellow" borderRadius="full" size="sm" />
                      <Text fontSize="sm" color={secondary} w="30px">{count}</Text>
                    </HStack>
                  );
                })}
              </VStack>
            </Box>
          </SimpleGrid>
        )}

        {/* Filter */}
        <Flex gap={4} mb={6} flexWrap="wrap">
          <Select placeholder="Semua Rating" value={rating} onChange={e => setRating(e.target.value)} maxW="200px">
            {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Bintang</option>)}
          </Select>
          <Select placeholder="Semua Periode" value={period} onChange={e => setPeriod(e.target.value)} maxW="200px">
            <option value="month">1 Bulan Terakhir</option>
            <option value="3months">3 Bulan Terakhir</option>
            <option value="year">1 Tahun Terakhir</option>
          </Select>
        </Flex>

        {/* Daftar ulasan */}
        {loading ? (
          <Flex justify="center" py={20}><Spinner size="xl" color="blue.400" /></Flex>
        ) : reviews.length === 0 ? (
          <Text textAlign="center" py={20} color={secondary}>Belum ada ulasan untuk profil Anda.</Text>
        ) : (
          <VStack spacing={4} align="stretch">
            {reviews.map(r => (
              <Box key={r.id} bg={cardBg} p={5} borderRadius="lg" boxShadow="sm"
                border="1px solid" borderColor={border}>
                <Flex justify="space-between" align="flex-start" mb={3} gap={2}>
                  <HStack align="start" spacing={3} minW={0} flex={1}>
                    <Avatar name={r.user?.name ?? 'Wisatawan'} src={r.user?.avatar_url ?? undefined} size="sm" flexShrink={0} />
                    <VStack align="start" spacing={0.5} minW={0}>
                      <HStack spacing={2} flexWrap="wrap">
                        <Text fontWeight="semibold" fontSize="sm">{r.user?.name ?? 'Wisatawan'}</Text>
                        <Badge
                          colorScheme={r.type === 'guide' ? 'blue' : 'teal'}
                          fontSize="2xs"
                          px={1.5}
                          borderRadius="md"
                        >
                          {r.type === 'guide' ? 'Ulasan Pemandu' : `Paket: ${r.tour_name ?? '—'}`}
                        </Badge>
                      </HStack>
                      <Text fontSize="xs" color={secondary}>{fmtDate(r.created_at)}</Text>
                    </VStack>
                  </HStack>
                  <Box flexShrink={0}>
                    <Stars rating={r.rating} />
                  </Box>
                </Flex>
                {r.comment && <Text fontSize="sm" color="gray.700">{r.comment}</Text>}
              </Box>
            ))}
          </VStack>
        )}
      </Box>
    </GuideLayout>
  );
};

export default GuideReviews;
