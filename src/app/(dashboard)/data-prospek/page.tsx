"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useKodeAds } from "@/hooks/useKodeAds";
import { useLayanan } from "@/hooks/useLayanan";
import { useStatusLeads } from "@/hooks/useStatusLeads";
import { useProspek, useDeleteProspek, useUpdateProspek } from "@/hooks/useProspek";
import { useSumberLeads } from "@/hooks/useSumberLeads";
import { useTipeFaskes } from "@/hooks/useTipeFaskes";
import { useBukanLeads } from "@/hooks/useBukanLeads";
import { useProduk } from "@/hooks/useProduk";
import { useCreateKonversi, useUpdateKonversi, useDeleteKonversi, useKonversiByProspekId } from "@/hooks/useKonversi";

import { 
  Search, UserPlus, Eye, Edit3, Trash2, ChevronLeft, ChevronRight,
  Users, Calendar, MapPin, Building, Phone, Target, FileText, Filter, X,
  CheckCircle, AlertCircle, Code, PlusCircle, Pencil, ArrowRight, DollarSign,
  Clock, Package, UserCheck, RefreshCw, ArrowRightLeft, Plus
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Data dummy untuk prospek
const dummyProspects = [
  {
    id: 1,
    createdDate: "2025-09-27",
    prospectDate: "2025-09-26",
    leadSource: "Instagram",
    adsCode: "IGM-2024-001",
    adsId: "IG-12345",
    prospectName: "Dr. Sarah Johnson",
    whatsappNumber: "+62812-3456-7890",
    email: "sarah.johnson@rsmitra.co.id",
    leadStatus: "Leads",
    notLeadReason: "",
    bukanLeadsReason: "",
    description: "Tertarik dengan layanan medical check-up untuk karyawan rumah sakit",
    assistService: "Konsultasi Medis",
    faskesName: "RS Mitra Sehat",
    faskesType: "Rumah Sakit",
    faskesLocation: "Jakarta Selatan",
    faskesProvinsi: "DKI Jakarta",
    faskesKota: "Jakarta Selatan",
    picLead: "Jane Smith",
    keterangan: "Prospek berpotensi besar, sudah memiliki budget yang siap dan timeline implementasi yang jelas. Perlu follow up dalam 3 hari."
  },
  {
    id: 2,
    createdDate: "2025-09-27",
    prospectDate: "2025-09-25",
    leadSource: "Facebook",
    adsCode: "FBM-2024-002",
    adsId: "FB-67890",
    prospectName: "Dr. Michael Chen",
    whatsappNumber: "+62813-4567-8901",
    email: "michael.chen@kliniksb.com",
    leadStatus: "Dihubungi",
    notLeadReason: "",
    bukanLeadsReason: "",
    description: "Menanyakan paket vaksinasi untuk karyawan perusahaan",
    assistService: "Vaksinasi",
    faskesName: "Klinik Sehat Bersama",
    faskesType: "Klinik",
    faskesLocation: "Jakarta Timur",
    faskesProvinsi: "DKI Jakarta",
    faskesKota: "Jakarta Timur",
    picLead: "John Doe",
    keterangan: "Klinik dengan manajemen profesional. Membutuhkan proposal detail untuk vaksinasi 150 karyawan. Jadwal follow up meeting Senin depan."
  },
  {
    id: 3,
    createdDate: "2025-09-26",
    prospectDate: "2025-09-24",
    leadSource: "Google Ads",
    adsCode: "GAD-2024-003",
    adsId: "GA-11111",
    prospectName: "Dr. Emily Rodriguez",
    whatsappNumber: "+62814-5678-9012",
    email: "emily.rodriguez@rsprimamedika.co.id",
    leadStatus: "Prospek",
    notLeadReason: "",
    bukanLeadsReason: "",
    description: "Konsultasi mengenai sistem manajemen rumah sakit dan integrasi teknologi",
    assistService: "Medical Check-up",
    faskesName: "RS Prima Medika",
    faskesType: "Rumah Sakit",
    faskesLocation: "Jakarta Barat",
    faskesProvinsi: "DKI Jakarta",
    faskesKota: "Jakarta Barat",
    picLead: "Mike Johnson",
    keterangan: "Rumah sakit besar dengan kebutuhan sistem terintegrasi. Masih dalam tahap evaluasi vendor. Kompetitor: 2 vendor lain."
  },
  {
    id: 4,
    createdDate: "2025-09-26",
    prospectDate: "2025-09-23",
    leadSource: "WhatsApp",
    adsCode: "WA-2024-004",
    adsId: "WA-22222",
    prospectName: "Dr. David Kim",
    whatsappNumber: "+62815-6789-0123",
    email: "david.kim@puskesmascempaka.go.id",
    leadStatus: "Bukan Leads",
    notLeadReason: "Tidak tertarik",
    bukanLeadsReason: "Sudah memiliki sistem serupa dari vendor lain",
    description: "Sudah memiliki sistem serupa dan tidak membutuhkan tambahan layanan",
    assistService: "Konsultasi Medis",
    faskesName: "Puskesmas Cempaka",
    faskesType: "Puskesmas",
    faskesLocation: "Jakarta Utara",
    faskesProvinsi: "DKI Jakarta",
    faskesKota: "Jakarta Utara",
    picLead: "Jane Smith",
    keterangan: "Kontrak dengan vendor lain masih berlaku hingga 2 tahun ke depan. Bisa di-approach lagi setelah kontrak berakhir."
  },
  {
    id: 5,
    createdDate: "2025-09-25",
    prospectDate: "2025-09-22",
    leadSource: "Website",
    adsCode: "WEB-2024-005",
    adsId: "WB-33333",
    prospectName: "Dr. Lisa Wang",
    whatsappNumber: "+62816-7890-1234",
    email: "lisa.wang@rshusada.co.id",
    leadStatus: "Follow Up",
    notLeadReason: "",
    bukanLeadsReason: "",
    description: "Membutuhkan demo sistem terbaru untuk evaluasi pembelian",
    assistService: "Vaksinasi",
    faskesName: "RS Husada",
    faskesType: "Rumah Sakit",
    faskesLocation: "Jakarta Pusat",
    faskesProvinsi: "DKI Jakarta",
    faskesKota: "Jakarta Pusat",
    picLead: "John Doe",
    keterangan: "Sangat tertarik dengan fitur terbaru. Demo dijadwalkan Kamis 14:00. Tim IT akan hadir, siapkan presentasi teknis yang detail."
  },
  {
    id: 6,
    createdDate: "2025-09-25",
    prospectDate: "2025-09-21",
    leadSource: "Instagram",
    adsCode: "IGM-2024-006",
    adsId: "IG-44444",
    prospectName: "Dr. Robert Brown",
    whatsappNumber: "+62817-8901-2345",
    email: "robert.brown@klinikfamilia.com",
    leadStatus: "Qualified",
    notLeadReason: "",
    bukanLeadsReason: "",
    description: "Siap untuk implementasi sistem bulan depan setelah evaluasi budget",
    assistService: "Medical Check-up",
    faskesName: "Klinik Familia",
    faskesType: "Klinik",
    faskesLocation: "Tangerang",
    faskesProvinsi: "Banten",
    faskesKota: "Tangerang",
    picLead: "Mike Johnson",
    keterangan: "Hot prospect! Budget sudah approved. Menunggu final approval dari direktur. Deal closing dalam 2 minggu."
  },
  // Customer dengan langganan aktif dan expired
  {
    id: 7,
    createdDate: "2025-07-15",
    prospectDate: "2025-07-10",
    leadSource: "Referral",
    adsCode: "REF-2024-007",
    adsId: "RF-55555",
    prospectName: "Dr. Sari Medika",
    whatsappNumber: "+62818-9012-3456",
    email: "admin@rsmedika.co.id",
    leadStatus: "Customer",
    notLeadReason: "",
    bukanLeadsReason: "",
    description: "Customer aktif dengan langganan RME dan Solmet",
    assistService: "RME",
    faskesName: "RS Medika",
    faskesType: "Rumah Sakit",
    faskesLocation: "Jakarta Selatan",
    faskesProvinsi: "DKI Jakarta",
    faskesKota: "Jakarta Selatan",
    picLead: "Jane Smith",
    keterangan: "Customer sejak Juli 2025. Sangat puas dengan layanan RME. Sedang evaluasi untuk menambah layanan baru.",
    conversionData: [
      {
        id: 1,
        serviceId: 1,
        serviceName: "RME",
        productId: 1, 
        productName: "Privata",
        transactionValue: 6000000,
        subscriptionDuration: 3,
        durationType: "months",
        conversionDate: "2025-07-15",
        startDate: "2025-07-15",
        endDate: "2025-10-15", // Masih aktif sampai 15 Oktober
        status: "active",
        isRenewal: false
      },
      {
        id: 2,
        serviceId: 2,
        serviceName: "Solmet",
        productId: 9,
        productName: "Maxima",
        transactionValue: 8500000,
        subscriptionDuration: 6,
        durationType: "months", 
        conversionDate: "2025-08-01",
        startDate: "2025-08-01",
        endDate: "2026-02-01", // Aktif sampai Februari 2026
        status: "active",
        isRenewal: false
      }
    ]
  },
  {
    id: 8,
    createdDate: "2025-05-20",
    prospectDate: "2025-05-15",
    leadSource: "Website",
    adsCode: "WEB-2024-008",
    adsId: "WB-66666",
    prospectName: "Dr. Healthy Klinik",
    whatsappNumber: "+62819-0123-4567",
    email: "info@kliniksehat.com",
    leadStatus: "Customer",
    notLeadReason: "",
    bukanLeadsReason: "",
    description: "Customer dengan langganan campuran aktif dan expired",
    assistService: "Solmet",
    faskesName: "Klinik Sehat",
    faskesType: "Klinik",
    faskesLocation: "Bandung",
    faskesProvinsi: "Jawa Barat",
    faskesKota: "Bandung",
    picLead: "John Doe",
    keterangan: "Customer lama sejak Mei 2025. Ada langganan yang sudah expired dan perlu perpanjangan.",
    conversionData: [
      {
        id: 3,
        serviceId: 2,
        serviceName: "Solmet",
        productId: 9,
        productName: "Maxima",
        transactionValue: 4500000,
        subscriptionDuration: 6,
        durationType: "months",
        conversionDate: "2025-05-20",
        startDate: "2025-05-20",
        endDate: "2025-11-20", // Aktif sampai November 2025
        status: "active",
        isRenewal: false
      },
      {
        id: 4,
        serviceId: 1,
        serviceName: "RME",
        productId: 1,
        productName: "Privata",
        transactionValue: 3000000,
        subscriptionDuration: 3,
        durationType: "months",
        conversionDate: "2025-06-01",
        startDate: "2025-06-01",
        endDate: "2025-09-01", // Sudah expired sejak 1 September
        status: "expired",
        isRenewal: false
      }
    ]
  },
  {
    id: 9,
    createdDate: "2025-04-10",
    prospectDate: "2025-04-05",
    leadSource: "Google Ads",
    adsCode: "GAD-2024-009",
    adsId: "GA-77777",
    prospectName: "Dr. Prima Care",
    whatsappNumber: "+62820-1234-5678",
    email: "admin@primacare.co.id",
    leadStatus: "Customer",
    notLeadReason: "",
    bukanLeadsReason: "",
    description: "Customer dengan riwayat perpanjangan langganan",
    assistService: "Website Development",
    faskesName: "Klinik Prima Care",
    faskesType: "Klinik",
    faskesLocation: "Surabaya",
    faskesProvinsi: "Jawa Timur",
    faskesKota: "Surabaya",
    picLead: "Mike Johnson",
    keterangan: "Customer loyal dengan beberapa kali perpanjangan langganan. Total LTV tinggi.",
    conversionData: [
      {
        id: 5,
        serviceId: 3,
        serviceName: "Website Development",
        productId: 13,
        productName: "Corporate Website",
        transactionValue: 15000000,
        subscriptionDuration: 12,
        durationType: "months",
        conversionDate: "2025-04-10",
        startDate: "2025-04-10",
        endDate: "2026-04-10", // Aktif sampai April 2026
        status: "active",
        isRenewal: false
      },
      {
        id: 6,
        serviceId: 3,
        serviceName: "Website Development",
        productId: 13,
        productName: "Corporate Website",
        transactionValue: 12000000,
        subscriptionDuration: 12,
        durationType: "months",
        conversionDate: "2025-08-15", // Renewal/perpanjangan
        startDate: "2026-04-10", // Mulai setelah periode sebelumnya berakhir
        endDate: "2027-04-10", // Extended sampai 2027
        status: "active",
        isRenewal: true,
        originalSubscriptionId: 5
      }
    ]
  }
];

const getStatusBadge = (status) => {
  const statusConfig = {
    "Prospek": {
      className: "text-xs rounded-full bg-transparent text-gray-700 border border-gray-300 font-medium px-3 py-1 inline-block my-1"
    },
    "Dihubungi": {
      className: "text-xs rounded-full bg-transparent text-blue-700 border border-blue-300 font-medium px-3 py-1 inline-block my-1"
    },
    "Leads": {
      className: "text-xs rounded-full bg-transparent text-green-700 border border-green-300 font-medium px-3 py-1 inline-block my-1"
    },
    "Bukan Leads": {
      className: "text-xs rounded-full bg-transparent text-red-700 border border-red-300 font-medium px-3 py-1 inline-block my-1"
    },
    "On Going": {
      className: "text-xs rounded-full bg-transparent text-orange-700 border border-orange-300 font-medium px-3 py-1 inline-block my-1"
    },
    "Follow Up": {
      className: "text-xs rounded-full bg-transparent text-yellow-700 border border-yellow-400 font-medium px-3 py-1 inline-block my-1"
    },
    "Qualified": {
      className: "text-xs rounded-full bg-transparent text-purple-700 border border-purple-300 font-medium px-3 py-1 inline-block my-1"
    },
    "Customer": {
      className: "text-xs rounded-full bg-transparent text-emerald-700 border border-emerald-400 font-medium px-3 py-1 inline-block my-1"
    }
  };
  
  const config = statusConfig[status] || {
    className: "text-xs rounded-full bg-transparent text-slate-700 border border-slate-300 font-medium px-3 py-1 inline-block my-1"
  };
  
  return (
    <span className={config.className}>
      {status}
    </span>
  );
};

// Data dummy untuk kode ads
const dummyAdsCodes = [
  { id: 1, code: "IGM-2024-001", name: "Instagram Marketing Campaign Q4", createdAt: "2025-09-01", updatedAt: "2025-09-27" },
  { id: 2, code: "FBM-2024-002", name: "Facebook Ads - Healthcare", createdAt: "2025-09-05", updatedAt: "2025-09-25" },
  { id: 3, code: "GAD-2024-003", name: "Google Ads Medical Services", createdAt: "2025-09-10", updatedAt: "2025-09-26" },
  { id: 4, code: "WA-2024-004", name: "WhatsApp Marketing", createdAt: "2025-09-15", updatedAt: "2025-09-27" },
  { id: 5, code: "WEB-2024-005", name: null, createdAt: "2025-09-20", updatedAt: "2025-09-27" },
];



export default function DataProspekPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch data from Data Master
  const { data: kodeAdsList = [] } = useKodeAds();
  const { data: layananList = [] } = useLayanan();
  const { data: statusLeadsList = [] } = useStatusLeads();
  const { data: produkList = [] } = useProduk();
  
  // Fetch prospek data from database
  const { data: prospekList = [], isLoading: loadingProspek } = useProspek();
  const deleteProspekMutation = useDeleteProspek();
  const updateProspekMutation = useUpdateProspek();
  
  // Fetch additional master data for mapping
  const { data: sumberLeadsList = [] } = useSumberLeads();
  const { data: tipeFaskesList = [] } = useTipeFaskes();
  const { data: bukanLeadsList = [] } = useBukanLeads();
  
  // Konversi customer mutations
  const createKonversiMutation = useCreateKonversi();
  const updateKonversiMutation = useUpdateKonversi();
  const deleteKonversiMutation = useDeleteKonversi();



  // Modal states
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedProspect, setSelectedProspect] = useState(null);
  
  // Fetch konversi data for selected prospek
  const { data: konversiData, isLoading: loadingKonversi } = useKonversiByProspekId(selectedProspect?.id);
  
  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [prospectToDelete, setProspectToDelete] = useState(null);

  // Conversion modal states
  const [showConversionConfirmModal, setShowConversionConfirmModal] = useState(false);
  const [showConversionFormModal, setShowConversionFormModal] = useState(false);
  const [prospectToConvert, setProspectToConvert] = useState(null);
  const [conversionForm, setConversionForm] = useState({
    serviceProductItems: [
      {
        id: 1,
        serviceId: '',
        productId: '',
        transactionValue: '',
        subscriptionDuration: '',
        durationType: 'months', // 'months' or 'years'
        startDate: new Date().toISOString().split('T')[0] // Default ke tanggal hari ini
      }
    ]
  });
  const [conversionErrors, setConversionErrors] = useState({});
  const [isConverting, setIsConverting] = useState(false);

  // Master data untuk produk dan layanan (dinamis dari database)
  const masterServices = React.useMemo(() => {
    return layananList.map((layanan: any) => ({
      id: layanan.id,
      name: layanan.nama,
      description: '' // Layanan tidak punya deskripsi di schema
    })).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [layananList]);

  const masterProducts = React.useMemo(() => {
    return produkList.map((produk: any) => ({
      id: produk.id,
      name: produk.nama,
      serviceId: produk.layananId,
      serviceName: produk.layanan?.nama || ''
    })).sort((a: any, b: any) => a.name.localeCompare(b.name));
  }, [produkList]);

  // Format Rupiah functions
  const formatRupiah = (angka) => {
    if (!angka) return '';
    
    // Remove non-numeric characters
    const number = angka.toString().replace(/[^\d]/g, '');
    
    // Format with thousand separators
    const formatted = number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    
    return `Rp ${formatted}`;
  };

  const unformatRupiah = (rupiah) => {
    if (!rupiah) return '';
    // Remove all non-numeric characters
    return rupiah.replace(/[^\d]/g, '');
  };

  // Notification state
  const [notification, setNotification] = useState(null);
  
  // Map prospek data from database to UI format using useMemo to avoid infinite loop
  const prospects = React.useMemo(() => {
    if (prospekList.length === 0 || sumberLeadsList.length === 0) {
      return [];
    }
    
    return prospekList.map((prospek: any) => {
      const sumberLeadsName = sumberLeadsList.find((s: any) => s.id === prospek.sumberLeadsId)?.nama || '';
      const kodeAdsName = prospek.kodeAdsId ? (kodeAdsList.find((k: any) => k.id === prospek.kodeAdsId)?.kode || '') : '';
      const statusLeadsName = statusLeadsList.find((s: any) => s.id === prospek.statusLeadsId)?.nama || '';
      const bukanLeadsName = prospek.bukanLeadsId ? (bukanLeadsList.find((b: any) => b.id === prospek.bukanLeadsId)?.nama || '') : '';
      const layananName = layananList.find((l: any) => l.id === prospek.layananAssistId)?.nama || '';
      const tipeFaskesName = tipeFaskesList.find((t: any) => t.id === prospek.tipeFaskesId)?.nama || '';
      
      return {
        id: prospek.id,
        createdDate: new Date(prospek.createdAt).toISOString().split('T')[0],
        prospectDate: new Date(prospek.tanggalProspek).toISOString().split('T')[0],
        leadSource: sumberLeadsName,
        adsCode: kodeAdsName,
        adsId: prospek.idAds || '',
        prospectName: prospek.namaProspek,
        whatsappNumber: prospek.noWhatsApp,
        email: prospek.email || '',
        leadStatus: statusLeadsName,
        notLeadReason: bukanLeadsName,
        bukanLeadsReason: prospek.keteranganBukanLeads || '',
        description: prospek.keterangan || '',
        assistService: layananName,
        faskesName: prospek.namaFaskes,
        faskesType: tipeFaskesName,
        faskesLocation: prospek.kota,
        faskesProvinsi: prospek.provinsi,
        faskesKota: prospek.kota,
        picLead: prospek.picLeads,
        keterangan: prospek.keterangan || ''
      };
    });
  }, [prospekList, sumberLeadsList, kodeAdsList, statusLeadsList, bukanLeadsList, layananList, tipeFaskesList]);

  // Ads codes data state
  const [adsCodes, setAdsCodes] = useState(dummyAdsCodes);
  
  // Ads codes tab states
  const [adsCodesSearchTerm, setAdsCodesSearchTerm] = useState("");
  const [showAdsCodeModal, setShowAdsCodeModal] = useState(false);
  const [showEditAdsCodeModal, setShowEditAdsCodeModal] = useState(false);
  const [showDeleteAdsCodeModal, setShowDeleteAdsCodeModal] = useState(false);
  const [adsCodeToDelete, setAdsCodeToDelete] = useState(null);
  const [editingAdsCode, setEditingAdsCode] = useState(null);
  const [adsCodeForm, setAdsCodeForm] = useState({
    code: "",
    name: ""
  });



  // Filter states
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  // Filter selections in the panel (not yet applied)
  const [filters, setFilters] = useState({
    kodeAds: "all",
    layananAssist: "all",
    statusLeads: "all",
    periodeWaktu: "all",
    customStartDate: "",
    customEndDate: ""
  });

  // Actually applied filters (used for filtering data)
  const [appliedFilters, setAppliedFilters] = useState({
    kodeAds: "all",
    layananAssist: "all",
    statusLeads: "all",
    periodeWaktu: "all",
    customStartDate: "",
    customEndDate: ""
  });

  // Master data for filters - dynamically fetched from Data Master and sorted alphabetically
  const kodeAdsOptions = kodeAdsList
    .map((item: any) => item.kode)
    .sort((a: string, b: string) => a.localeCompare(b));

  const layananAssistOptions = layananList
    .map((item: any) => item.nama)
    .sort((a: string, b: string) => a.localeCompare(b));

  const statusLeadsOptions = statusLeadsList
    .map((item: any) => item.nama)
    .sort((a: string, b: string) => a.localeCompare(b));

  const periodeWaktuOptions = [
    { value: "today", label: "Hari ini" },
    { value: "yesterday", label: "Kemarin" },
    { value: "thisMonth", label: "Bulan ini" },
    { value: "lastMonth", label: "Bulan lalu" },
    { value: "custom", label: "Custom" }
  ];

  // Helper functions for date filtering
  const isToday = (dateStr) => {
    const today = new Date().toISOString().split('T')[0];
    return dateStr === today;
  };

  const isYesterday = (dateStr) => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return dateStr === yesterday.toISOString().split('T')[0];
  };

  const isThisMonth = (dateStr) => {
    const date = new Date(dateStr);
    const now = new Date();
    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
  };

  const isLastMonth = (dateStr) => {
    const date = new Date(dateStr);
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);
    return date.getMonth() === lastMonth.getMonth() && date.getFullYear() === lastMonth.getFullYear();
  };

  const isInDateRange = (dateStr, startDate, endDate) => {
    if (!startDate || !endDate) return true;
    const date = new Date(dateStr);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return date >= start && date <= end;
  };

  // Filter data berdasarkan search term dan filters
  const filteredProspects = prospects.filter(prospect => {
    // Search filter
    const searchMatch = prospect.prospectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.faskesName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.leadSource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.adsCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prospect.whatsappNumber.includes(searchTerm) ||
      prospect.leadStatus.toLowerCase().includes(searchTerm.toLowerCase());

    // Advanced filters - use appliedFilters instead of filters
    const kodeAdsMatch = appliedFilters.kodeAds === "all" || prospect.adsCode === appliedFilters.kodeAds;
    const layananAssistMatch = appliedFilters.layananAssist === "all" || prospect.assistService === appliedFilters.layananAssist;
    const statusLeadsMatch = appliedFilters.statusLeads === "all" || prospect.leadStatus === appliedFilters.statusLeads;

    // Date filter - use appliedFilters instead of filters
    let dateMatch = true;
    if (appliedFilters.periodeWaktu && appliedFilters.periodeWaktu !== "all") {
      switch (appliedFilters.periodeWaktu) {
        case "today":
          dateMatch = isToday(prospect.prospectDate);
          break;
        case "yesterday":
          dateMatch = isYesterday(prospect.prospectDate);
          break;
        case "thisMonth":
          dateMatch = isThisMonth(prospect.prospectDate);
          break;
        case "lastMonth":
          dateMatch = isLastMonth(prospect.prospectDate);
          break;
        case "custom":
          dateMatch = isInDateRange(prospect.prospectDate, appliedFilters.customStartDate, appliedFilters.customEndDate);
          break;
        default:
          dateMatch = true;
      }
    }

    return searchMatch && kodeAdsMatch && layananAssistMatch && statusLeadsMatch && dateMatch;
  });

  // Pagination logic
  const totalItems = filteredProspects.length;
  const totalPages = Math.ceil(totalItems / parseInt(itemsPerPage));
  const startIndex = (currentPage - 1) * parseInt(itemsPerPage);
  const endIndex = startIndex + parseInt(itemsPerPage);
  const currentProspects = filteredProspects.slice(startIndex, endIndex);

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Filter management functions
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      // Reset custom dates when changing period
      ...(key === 'periodeWaktu' && value !== 'custom' ? { customStartDate: '', customEndDate: '' } : {})
    }));
  };

  const resetFilters = () => {
    const defaultFilters = {
      kodeAds: "all",
      layananAssist: "all",
      statusLeads: "all",
      periodeWaktu: "all",
      customStartDate: "",
      customEndDate: ""
    };
    
    setFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setCurrentPage(1);
    // Note: Do NOT close the panel here - it stays open
  };

  const applyFilters = () => {
    // Apply the current filter selections to the applied filters
    setAppliedFilters({ ...filters });
    setCurrentPage(1);
    // Close the filter panel automatically after applying filters
    setShowFilterPanel(false);
  };

  const closeFilterPanel = () => {
    setShowFilterPanel(false);
  };

  // Modal management functions
  const openDetailModal = (prospect) => {
    setSelectedProspect(prospect);
    setShowDetailModal(true);
  };

  const closeDetailModal = () => {
    setShowDetailModal(false);
    setSelectedProspect(null);
  };

  // Delete confirmation modal functions
  const openDeleteModal = (prospect) => {
    setProspectToDelete(prospect);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setProspectToDelete(null);
  };

  const handleDeleteProspect = async () => {
    if (prospectToDelete) {
      try {
        // Delete from database
        await deleteProspekMutation.mutateAsync(prospectToDelete.id);
        
        // Close the modal
        closeDeleteModal();
        
        // Reset to first page if current page becomes empty
        const remainingProspects = prospects.filter(prospect => prospect.id !== prospectToDelete.id);
        const newTotalPages = Math.ceil(remainingProspects.length / parseInt(itemsPerPage));
        if (currentPage > newTotalPages && newTotalPages > 0) {
          setCurrentPage(newTotalPages);
        }
        
        // Show delete notification
        showNotification("Data prospek berhasil dihapus.", "success");
      } catch (error) {
        console.error('Error deleting prospek:', error);
        showNotification("Gagal menghapus prospek. Silakan coba lagi.", "error");
      }
    }
  };

  // Notification function
  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Conversion modal functions
  const openConversionConfirmModal = (prospect) => {
    setProspectToConvert(prospect);
    setShowConversionConfirmModal(true);
  };

  const closeConversionConfirmModal = () => {
    setShowConversionConfirmModal(false);
    setProspectToConvert(null);
  };

  const openConversionFormModal = () => {
    setShowConversionConfirmModal(false);
    // Set initial values berdasarkan data prospek
    const currentService = masterServices.find(s => s.name === prospectToConvert?.assistService);
    setConversionForm({
      serviceProductItems: [
        {
          id: 1,
          serviceId: currentService?.id?.toString() || '',
          productId: '',
          transactionValue: '',
          subscriptionDuration: '',
          durationType: 'months',
          startDate: new Date().toISOString().split('T')[0]
        }
      ]
    });
    setConversionErrors({});
    setShowConversionFormModal(true);
  };

  // Function untuk menambah item layanan-produk baru
  const addServiceProductItem = () => {
    const newId = Math.max(...conversionForm.serviceProductItems.map(item => item.id)) + 1;
    setConversionForm(prev => ({
      ...prev,
      serviceProductItems: [
        ...prev.serviceProductItems,
        {
          id: newId,
          serviceId: '',
          productId: '',
          transactionValue: '',
          subscriptionDuration: '',
          durationType: 'months',
          startDate: new Date().toISOString().split('T')[0] // Default ke tanggal hari ini
        }
      ]
    }));
  };

  // Function untuk menghapus item layanan-produk
  const removeServiceProductItem = (itemId) => {
    if (conversionForm.serviceProductItems.length > 1) {
      setConversionForm(prev => ({
        ...prev,
        serviceProductItems: prev.serviceProductItems.filter(item => item.id !== itemId)
      }));
      
      // Clear errors for removed item
      setConversionErrors(prev => {
        const newErrors = {...prev};
        Object.keys(newErrors).forEach(key => {
          if (key.includes(`_${itemId}`)) {
            delete newErrors[key];
          }
        });
        return newErrors;
      });
    }
  };

  // Function untuk mengupdate field specific item
  const updateServiceProductItem = (itemId, field, value) => {
    setConversionForm(prev => ({
      ...prev,
      serviceProductItems: prev.serviceProductItems.map(item => 
        item.id === itemId ? {...item, [field]: value} : item
      )
    }));

    // Clear error for this field
    const errorKey = `${field}_${itemId}`;
    if (conversionErrors[errorKey]) {
      setConversionErrors(prev => ({...prev, [errorKey]: ''}));
    }

    // If service changes, reset product for that item
    if (field === 'serviceId') {
      setConversionForm(prev => ({
        ...prev,
        serviceProductItems: prev.serviceProductItems.map(item => 
          item.id === itemId ? {...item, serviceId: value, productId: ''} : item
        )
      }));
      
      // Clear product error too
      const productErrorKey = `productId_${itemId}`;
      if (conversionErrors[productErrorKey]) {
        setConversionErrors(prev => ({...prev, [productErrorKey]: ''}));
      }
    }
  };

  // Function untuk handling transaction value change dengan format Rupiah
  const handleTransactionValueChange = (itemId, e) => {
    const inputValue = e.target.value;
    const numericValue = unformatRupiah(inputValue);
    updateServiceProductItem(itemId, 'transactionValue', numericValue);
  };

  // Function untuk mendapatkan produk yang tersedia berdasarkan service
  const getAvailableProducts = (serviceId) => {
    if (!serviceId) return [];
    return masterProducts.filter(product => product.serviceId === parseInt(serviceId));
  };

  // Function untuk check apakah form sudah valid (semua items complete)
  const isFormComplete = () => {
    return conversionForm.serviceProductItems.every(item => {
      const hasService = item.serviceId.trim() !== '';
      const hasProduct = item.productId.trim() !== '';
      const hasValidTransaction = unformatRupiah(item.transactionValue).trim() !== '' && 
                                  !isNaN(Number(unformatRupiah(item.transactionValue))) && 
                                  parseFloat(unformatRupiah(item.transactionValue)) > 0;
      const hasValidDuration = item.subscriptionDuration.trim() !== '' && 
                               !isNaN(Number(item.subscriptionDuration)) && 
                               parseInt(item.subscriptionDuration) > 0;
      const hasValidStartDate = item.startDate && item.startDate.trim() !== '';
      
      return hasService && hasProduct && hasValidTransaction && hasValidDuration && hasValidStartDate;
    });
  };

  // Function untuk check status langganan (aktif/expired)
  const checkSubscriptionStatus = (endDate) => {
    const today = new Date();
    const expiry = new Date(endDate);
    return expiry >= today ? 'active' : 'expired';
  };

  // Function untuk menghitung total LTV customer
  const calculateCustomerLTV = (conversionData) => {
    if (!conversionData || !Array.isArray(conversionData)) return 0;
    return conversionData.reduce((total, item) => total + (item.transactionValue || 0), 0);
  };

  // Function untuk format tanggal
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short', 
      year: 'numeric'
    });
  };

  // Function untuk transform data konversi dari database ke format UI
  const transformKonversiToSubscriptions = (konversiDataArray) => {
    if (!konversiDataArray || !Array.isArray(konversiDataArray) || konversiDataArray.length === 0) {
      return [];
    }
    
    // Flatten all items from all konversi records
    const allSubscriptions = [];
    
    konversiDataArray.forEach((konversiData) => {
      if (konversiData.konversi_customer_item && konversiData.konversi_customer_item.length > 0) {
        konversiData.konversi_customer_item.forEach((item) => {
          const startDate = new Date(konversiData.tanggalKonversi);
          let endDate = new Date(startDate);
          
          // Calculate end date based on duration
          if (item.tipeDurasi === 'months') {
            endDate.setMonth(endDate.getMonth() + item.durasiLangganan);
          } else if (item.tipeDurasi === 'years') {
            endDate.setFullYear(endDate.getFullYear() + item.durasiLangganan);
          }
          
          allSubscriptions.push({
            id: item.id,
            serviceName: item.layanan?.nama || '-',
            productName: item.produk?.nama || '-',
            transactionValue: item.nilaiTransaksi || 0,
            subscriptionDuration: item.durasiLangganan,
            durationType: item.tipeDurasi,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            conversionDate: konversiData.tanggalKonversi,
            isRenewal: false
          });
        });
      }
    });
    
    return allSubscriptions;
  };
  
  // Function untuk calculate total LTV dari konversi array
  const calculateTotalLTV = (konversiDataArray) => {
    if (!konversiDataArray || !Array.isArray(konversiDataArray)) return 0;
    return konversiDataArray.reduce((total, konversi) => {
      return total + (konversi.totalNilaiTransaksi || 0);
    }, 0);
  };

  // States untuk modal detail customer dan perpanjangan
  const [showCustomerDetailModal, setShowCustomerDetailModal] = useState(false);
  const [showRenewalModal, setShowRenewalModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSubscription, setSelectedSubscription] = useState(null);
  const [renewalForm, setRenewalForm] = useState({
    duration: '',
    durationType: 'months',
    transactionValue: '',
    startDate: ''
  });
  const [renewalErrors, setRenewalErrors] = useState({});
  const [isProcessingRenewal, setIsProcessingRenewal] = useState(false);
  
  // Fetch konversi data for selected customer
  const { data: customerKonversiData, isLoading: loadingCustomerKonversi } = useKonversiByProspekId(selectedCustomer?.id);

  const closeConversionFormModal = () => {
    setShowConversionFormModal(false);
    setProspectToConvert(null);
    setConversionForm({
      serviceProductItems: [
        {
          id: 1,
          serviceId: '',
          productId: '',
          transactionValue: '',
          subscriptionDuration: '',
          durationType: 'months',
          startDate: new Date().toISOString().split('T')[0]
        }
      ]
    });
    setConversionErrors({});
    setIsConverting(false);
  };

  // Functions untuk customer detail dan renewal
  const openCustomerDetail = (customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetailModal(true);
  };

  const openRenewalModal = (customer, subscription) => {
    setSelectedCustomer(customer);
    setSelectedSubscription(subscription);
    // Set default values
    setRenewalForm({
      duration: '',
      durationType: 'months',
      transactionValue: '',
      startDate: subscription.endDate // Default mulai dari tanggal berakhir langganan sebelumnya
    });
    setRenewalErrors({});
    setShowRenewalModal(true);
  };

  const handleRenewalSubmit = async (e) => {
    e.preventDefault();
    setIsProcessingRenewal(true);

    try {
      // Validate renewal form
      const errors = {};
      if (!renewalForm.duration.trim()) {
        errors['duration'] = 'Durasi wajib diisi';
      } else if (isNaN(Number(renewalForm.duration)) || parseInt(renewalForm.duration) <= 0) {
        errors['duration'] = 'Durasi harus berupa angka positif';
      }

      const numericValue = unformatRupiah(renewalForm.transactionValue);
      if (!numericValue || numericValue.trim() === '') {
        errors['transactionValue'] = 'Nilai transaksi wajib diisi';
      } else if (isNaN(Number(numericValue)) || parseFloat(numericValue) <= 0) {
        errors['transactionValue'] = 'Nilai transaksi harus berupa angka positif';
      }

      if (!renewalForm.startDate.trim()) {
        errors['startDate'] = 'Tanggal mulai wajib diisi';
      }

      if (Object.keys(errors).length > 0) {
        setRenewalErrors(errors);
        setIsProcessingRenewal(false);
        return;
      }

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Calculate end date
      const startDate = new Date(renewalForm.startDate);
      const endDate = new Date(startDate);
      const duration = parseInt(renewalForm.duration);

      if (renewalForm.durationType === 'months') {
        endDate.setMonth(endDate.getMonth() + duration);
      } else {
        endDate.setFullYear(endDate.getFullYear() + duration);
      }

      // Create new renewal subscription
      const renewalSubscription = {
        id: Date.now(),
        serviceId: selectedSubscription.serviceId,
        serviceName: selectedSubscription.serviceName,
        productId: selectedSubscription.productId,
        productName: selectedSubscription.productName,
        transactionValue: parseFloat(numericValue),
        subscriptionDuration: duration,
        durationType: renewalForm.durationType,
        conversionDate: new Date().toISOString().split('T')[0],
        startDate: renewalForm.startDate,
        endDate: endDate.toISOString().split('T')[0],
        status: 'active',
        isRenewal: true,
        originalSubscriptionId: selectedSubscription.id
      };

      // Close modal and show success
      setShowRenewalModal(false);
      showNotification(
        `Perpanjangan langganan ${selectedSubscription.serviceName} - ${selectedSubscription.productName} berhasil disimpan!`,
        "success"
      );

      // Refresh customer detail if open
      if (showCustomerDetailModal) {
        const updatedProspects = prospects.map(prospect =>
          prospect.id === selectedCustomer.id
            ? {
                ...prospect,
                conversionData: [...(prospect.conversionData || []), renewalSubscription]
              }
            : prospect
        );
        const updatedCustomer = updatedProspects.find(p => p.id === selectedCustomer.id);
        setSelectedCustomer(updatedCustomer);
      }

    } catch (error) {
      showNotification("Terjadi kesalahan saat memproses perpanjangan langganan.", "error");
    } finally {
      setIsProcessingRenewal(false);
    }
  };

  const handleRenewalTransactionChange = (e) => {
    const inputValue = e.target.value;
    const numericValue = unformatRupiah(inputValue);
    setRenewalForm(prev => ({...prev, transactionValue: numericValue}));
    
    if (renewalErrors['transactionValue']) {
      setRenewalErrors(prev => ({...prev, transactionValue: ''}));
    }
  };

  const validateConversionForm = () => {
    const errors = {};
    const usedServiceProducts = new Set(); // Untuk tracking duplikasi
    
    // Validasi setiap item layanan-produk
    conversionForm.serviceProductItems.forEach((item, index) => {
      const itemId = item.id;
      
      // Validasi service
      if (!item.serviceId) {
        errors[`serviceId_${itemId}`] = 'Layanan wajib dipilih';
      }
      
      // Validasi product
      if (!item.productId) {
        errors[`productId_${itemId}`] = 'Produk wajib dipilih';
      } else if (item.serviceId) {
        // Validasi bahwa produk sesuai dengan layanan
        const selectedProduct = masterProducts.find(p => p.id === parseInt(item.productId));
        if (selectedProduct && selectedProduct.serviceId !== parseInt(item.serviceId)) {
          errors[`productId_${itemId}`] = 'Produk tidak sesuai dengan layanan yang dipilih';
        }
        
        // Check duplikasi service-product combination
        const serviceProductKey = `${item.serviceId}-${item.productId}`;
        if (usedServiceProducts.has(serviceProductKey)) {
          errors[`productId_${itemId}`] = 'Kombinasi layanan-produk sudah dipilih sebelumnya';
        } else {
          usedServiceProducts.add(serviceProductKey);
        }
      }
      
      // Get numeric value from transaction input
      const numericTransactionValue = unformatRupiah(item.transactionValue);
      
      if (!numericTransactionValue || numericTransactionValue.trim() === '') {
        errors[`transactionValue_${itemId}`] = 'Nilai transaksi wajib diisi';
      } else if (isNaN(Number(numericTransactionValue)) || parseFloat(numericTransactionValue) <= 0) {
        errors[`transactionValue_${itemId}`] = 'Nilai transaksi harus berupa angka positif';
      } else if (parseFloat(numericTransactionValue) < 1000) {
        errors[`transactionValue_${itemId}`] = 'Nilai transaksi minimum Rp 1.000';
      }
      
      if (!item.subscriptionDuration.trim()) {
        errors[`subscriptionDuration_${itemId}`] = 'Durasi langganan wajib diisi';
      } else if (isNaN(Number(item.subscriptionDuration)) || parseInt(item.subscriptionDuration) <= 0) {
        errors[`subscriptionDuration_${itemId}`] = 'Durasi langganan harus berupa angka positif';
      }
      
      // Validasi tanggal mulai berlangganan
      if (!item.startDate || !item.startDate.trim()) {
        errors[`startDate_${itemId}`] = 'Tanggal mulai berlangganan wajib diisi';
      } else {
        const startDate = new Date(item.startDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time untuk comparison yang akurat
        
        if (isNaN(startDate.getTime())) {
          errors[`startDate_${itemId}`] = 'Format tanggal tidak valid';
        }
      }
    });
    
    return errors;
  };

  const handleConversionSubmit = async (e) => {
    e.preventDefault();
    setIsConverting(true);
    
    try {
      // Validasi status - hanya "Leads" yang bisa dikonversi
      if (prospectToConvert && prospectToConvert.leadStatus !== "Leads") {
        showNotification('Konversi hanya dapat dilakukan untuk prospek dengan status "Leads"', "error");
        closeConversionFormModal();
        return;
      }
      
      const formErrors = validateConversionForm();
      if (Object.keys(formErrors).length > 0) {
        setConversionErrors(formErrors);
        setIsConverting(false);
        return;
      }

      if (prospectToConvert) {
        // Prepare items for database
        const items = conversionForm.serviceProductItems.map((item) => {
          const numericTransactionValue = unformatRupiah(item.transactionValue);
          return {
            layananId: parseInt(item.serviceId),
            produkId: parseInt(item.productId),
            nilaiTransaksi: parseFloat(numericTransactionValue),
            durasiLangganan: parseInt(item.subscriptionDuration),
            tipeDurasi: item.durationType,
          };
        });

        // Calculate total transaction value
        const totalNilaiTransaksi = items.reduce((sum, item) => sum + item.nilaiTransaksi, 0);

        // Create konversi customer data
        const konversiData = {
          prospekId: prospectToConvert.id,
          tanggalKonversi: new Date().toISOString().split('T')[0],
          totalNilaiTransaksi: totalNilaiTransaksi,
          keterangan: `Konversi dari prospek: ${prospectToConvert.prospectName}`,
          items: items,
        };

        // Save to database
        await createKonversiMutation.mutateAsync(konversiData);
        
        // Update prospek status to "Customer"
        await updateProspekMutation.mutateAsync({
          id: prospectToConvert.id,
          data: {
            tanggalProspek: prospectToConvert.prospectDate,
            sumberLeads: prospectToConvert.leadSource,
            kodeAds: prospectToConvert.adsCode || '',
            idAds: prospectToConvert.adsId || '',
            namaProspek: prospectToConvert.prospectName,
            noWhatsApp: prospectToConvert.whatsappNumber,
            email: prospectToConvert.email || '',
            statusLeads: "Customer",  // Changed status
            bukanLeads: '',  // Clear bukanLeads when converting to Customer
            keteranganBukanLeads: '',  // Clear keteranganBukanLeads
            layananAssist: prospectToConvert.assistService || '',
            namaFaskes: prospectToConvert.faskesName || '',
            tipeFaskes: prospectToConvert.faskesType || '',
            provinsi: prospectToConvert.faskesProvinsi || '',
            kota: prospectToConvert.faskesKota || '',
            picLeads: prospectToConvert.picLead,
            keterangan: prospectToConvert.description || ''
          }
        });
        
        // Close conversion form modal
        closeConversionFormModal();
        const itemCount = conversionForm.serviceProductItems.length;
        const itemText = itemCount === 1 ? 'layanan' : 'layanan';
        showNotification(`Data berhasil dikonversi menjadi Customer! ${itemCount} ${itemText} dan produk telah tersimpan.`, "success");
      }
    } catch (error) {
      console.error('Error creating konversi:', error);
      showNotification(error.message || "Terjadi kesalahan saat konversi data. Silakan coba lagi.", "error");
    } finally {
      setIsConverting(false);
    }
  };

  // Handle ESC key press to close modals
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (showDeleteModal) {
          closeDeleteModal();
        } else if (showConversionConfirmModal) {
          closeConversionConfirmModal();
        } else if (showConversionFormModal) {
          closeConversionFormModal();
        }
      }
    };

    if (showDeleteModal || showConversionConfirmModal || showConversionFormModal) {
      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [showDeleteModal, showConversionConfirmModal, showConversionFormModal]);

  // Check for success notifications from localStorage (from add/edit operations)
  useEffect(() => {
    const successMessage = localStorage.getItem('prospectSuccess');
    if (successMessage) {
      showNotification(successMessage, "success");
      localStorage.removeItem('prospectSuccess');
    }
  }, []);

  // Check if any applied filters are active
  const hasActiveFilters = Object.values(appliedFilters).some(value => value !== "" && value !== "all");
  
  // Check if there are unsaved changes in filter selections
  const hasUnsavedChanges = JSON.stringify(filters) !== JSON.stringify(appliedFilters);

  // Reset to first page when search term, items per page, or applied filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, itemsPerPage, appliedFilters]);

  // Note: Removed click-outside close behavior as per requirements
  // Panel should only close when user clicks the "Close" button

  // Ads codes functions
  const showNotificationAds = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const filteredAdsCodes = adsCodes.filter(ads =>
    ads.code.toLowerCase().includes(adsCodesSearchTerm.toLowerCase()) ||
    (ads.name && ads.name.toLowerCase().includes(adsCodesSearchTerm.toLowerCase()))
  );

  const openAdsCodeModal = () => {
    setAdsCodeForm({ code: "", name: "" });
    setShowAdsCodeModal(true);
  };

  const closeAdsCodeModal = () => {
    setShowAdsCodeModal(false);
    setAdsCodeForm({ code: "", name: "" });
  };

  const openEditAdsCodeModal = (adsCode) => {
    setEditingAdsCode(adsCode);
    setAdsCodeForm({
      code: adsCode.code,
      name: adsCode.name || ""
    });
    setShowEditAdsCodeModal(true);
  };

  const closeEditAdsCodeModal = () => {
    setShowEditAdsCodeModal(false);
    setEditingAdsCode(null);
    setAdsCodeForm({ code: "", name: "" });
  };

  const openDeleteAdsCodeModal = (adsCode) => {
    setAdsCodeToDelete(adsCode);
    setShowDeleteAdsCodeModal(true);
  };

  const closeDeleteAdsCodeModal = () => {
    setShowDeleteAdsCodeModal(false);
    setAdsCodeToDelete(null);
  };

  const handleSubmitAdsCode = (e) => {
    e.preventDefault();
    if (!adsCodeForm.code.trim()) {
      showNotificationAds('error', 'Kode Ads wajib diisi!');
      return;
    }

    const newAdsCode = {
      id: Date.now(),
      code: adsCodeForm.code.trim(),
      name: adsCodeForm.name.trim() || null,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };

    setAdsCodes(prev => [...prev, newAdsCode]);
    showNotificationAds('success', `Kode ads "${newAdsCode.code}" berhasil ditambahkan!`);
    closeAdsCodeModal();
  };

  const handleUpdateAdsCode = (e) => {
    e.preventDefault();
    if (!adsCodeForm.code.trim()) {
      showNotificationAds('error', 'Kode Ads wajib diisi!');
      return;
    }

    setAdsCodes(prev => prev.map(ads => 
      ads.id === editingAdsCode.id 
        ? {
            ...ads,
            code: adsCodeForm.code.trim(),
            name: adsCodeForm.name.trim() || null,
            updatedAt: new Date().toISOString().split('T')[0]
          }
        : ads
    ));

    showNotificationAds('success', `Kode ads "${adsCodeForm.code}" berhasil diperbarui!`);
    closeEditAdsCodeModal();
  };

  const handleDeleteAdsCode = () => {
    if (adsCodeToDelete) {
      setAdsCodes(prev => prev.filter(ads => ads.id !== adsCodeToDelete.id));
      showNotificationAds('success', `Kode ads "${adsCodeToDelete.code}" berhasil dihapus!`);
      closeDeleteAdsCodeModal();
    }
  };



  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
        <CardHeader>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-500 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-slate-900">Data Prospek</CardTitle>
              <CardDescription className="text-slate-600">
                Kelola dan pantau data prospek leads yang masuk
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Content - Langsung tampilkan Data Prospek tanpa Tabs */}
      <div className="w-full">

      {/* Search and Filter Controls */}
      <Card className="border-0 shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            {/* Left group: Items per page + Search + Filter */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 flex-1">
              {/* Items per page */}
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-sm text-slate-600 whitespace-nowrap">Tampilkan:</span>
                <Select value={itemsPerPage} onValueChange={setItemsPerPage}>
                  <SelectTrigger className="w-20 h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
                <span className="text-sm text-slate-600 whitespace-nowrap">baris</span>
              </div>

              {/* Search and Filter Group */}
              <div className="flex items-center gap-3 flex-1 max-w-lg">
                {/* Search */}
                <div className="relative flex-1 min-w-0">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Cari prospek, faskes, sumber leads..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-50 border-slate-200 h-10 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                  />
                </div>

                {/* Filter Button */}
                <Button 
                  variant="outline"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`h-10 px-4 whitespace-nowrap shrink-0 transition-all duration-200 ${
                    hasActiveFilters 
                      ? 'border-blue-500 text-blue-600 bg-blue-50 shadow-md' 
                      : 'border-slate-300 hover:border-blue-400 hover:bg-blue-50'
                  }`}
                >
                  <Filter className="mr-2 h-4 w-4" />
                  Filter
                  {hasActiveFilters && (
                    <span className="ml-2 bg-blue-600 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center animate-pulse">
                      {Object.values(appliedFilters).filter(v => v !== "" && v !== "all").length}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          {showFilterPanel && (
            <div className="filter-panel mt-4 p-6 bg-slate-50 border border-slate-200 rounded-xl shadow-lg">
              <div className="space-y-6">
                {/* Filter Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900">Filter Data Prospek</h3>
                    <p className="text-sm text-slate-600 mt-1">
                      {hasUnsavedChanges ? 
                        '⚠️ Ada perubahan yang belum diterapkan' : 
                        'Sesuaikan filter sesuai kebutuhan Anda'}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={closeFilterPanel}
                    className="h-8 w-8 p-0 hover:bg-slate-200 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                {/* Filter Controls - Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Kode Ads */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Kode Ads</label>
                    <Select
                      value={filters.kodeAds}
                      onValueChange={(value) => handleFilterChange('kodeAds', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Semua Kode Ads" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kode Ads</SelectItem>
                        {kodeAdsOptions.map((kode) => (
                          <SelectItem key={kode} value={kode}>{kode}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                  {/* Layanan Assist */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Layanan Assist</label>
                    <Select
                      value={filters.layananAssist}
                      onValueChange={(value) => handleFilterChange('layananAssist', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Semua Layanan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Layanan</SelectItem>
                        {layananAssistOptions.map((layanan) => (
                          <SelectItem key={layanan} value={layanan}>{layanan}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Filter Controls - Row 2 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Leads */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Status Leads</label>
                    <Select
                      value={filters.statusLeads}
                      onValueChange={(value) => handleFilterChange('statusLeads', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Semua Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Status</SelectItem>
                        {statusLeadsOptions.map((status) => (
                          <SelectItem key={status} value={status}>{status}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Periode Waktu */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Periode Waktu</label>
                    <Select
                      value={filters.periodeWaktu}
                      onValueChange={(value) => handleFilterChange('periodeWaktu', value)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Semua Waktu" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Waktu</SelectItem>
                        {periodeWaktuOptions.map((periode) => (
                          <SelectItem key={periode.value} value={periode.value}>{periode.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Custom Date Range */}
                {filters.periodeWaktu === 'custom' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-white border border-slate-200 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Mulai</label>
                      <Input
                        type="date"
                        value={filters.customStartDate}
                        onChange={(e) => handleFilterChange('customStartDate', e.target.value)}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Tanggal Selesai</label>
                      <Input
                        type="date"
value={filters.customEndDate}
                        onChange={(e) => handleFilterChange('customEndDate', e.target.value)}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                {/* Filter Action Buttons */}
                <div className="flex justify-end gap-3 pt-4 border-t border-slate-200">
                  <Button
                    variant="outline"
                    onClick={resetFilters}
                    className="px-4 py-2"
                  >
                    Reset Filter
                  </Button>
                  <Button
                    variant="outline"
                    onClick={closeFilterPanel}
                    className="px-4 py-2 text-red-600 border-red-200 hover:bg-red-50"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={applyFilters}
                    className={`px-4 py-2 text-white transition-all duration-200 ${
                      hasUnsavedChanges 
                        ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-700 hover:to-orange-600 shadow-lg' 
                        : 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600'
                    }`}
                  >
                    {hasUnsavedChanges ? 'Terapkan Perubahan' : 'Terapkan Filter'}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>



        {/* Filter Results Summary Bar */}
        {hasActiveFilters && (
          <CardContent className="px-6 py-4 bg-gradient-to-r from-blue-50 to-blue-100 border-t border-blue-200 rounded-none">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
              {/* Results Count and Active Filters */}
              <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
                <span className="text-slate-700 whitespace-nowrap">
                  Hasil pencarian: <span className="font-semibold text-blue-700">{totalItems}</span> dari <span className="font-semibold">{dummyProspects.length}</span> data ditemukan
                </span>
                
                {/* Active Filters Display */}
                <div className="flex flex-wrap items-center gap-2">
                  {appliedFilters.kodeAds !== "all" && (
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-blue-200">
                      <span className="text-slate-600 text-xs">Kode Ads:</span>
                      <span className="font-bold text-blue-700 text-xs">"{appliedFilters.kodeAds}"</span>
                    </span>
                  )}
                  

                  {appliedFilters.layananAssist !== "all" && (
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-blue-200">
                      <span className="text-slate-600 text-xs">Layanan:</span>
                      <span className="font-bold text-blue-700 text-xs">"{appliedFilters.layananAssist}"</span>
                    </span>
                  )}
                  
                  {appliedFilters.statusLeads !== "all" && (
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-blue-200">
                      <span className="text-slate-600 text-xs">Status:</span>
                      <span className="font-bold text-blue-700 text-xs">"{appliedFilters.statusLeads}"</span>
                    </span>
                  )}
                  
                  {appliedFilters.periodeWaktu !== "all" && (
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded-md border border-blue-200">
                      <span className="text-slate-600 text-xs">Periode:</span>
                      <span className="font-bold text-blue-700 text-xs">
                        "{appliedFilters.periodeWaktu === "custom" 
                          ? `${appliedFilters.customStartDate} - ${appliedFilters.customEndDate}`
                          : periodeWaktuOptions.find(p => p.value === appliedFilters.periodeWaktu)?.label
                        }"
                      </span>
                    </span>
                  )}
                </div>
              </div>
              
              {/* Clear All Filters Button */}
              <Button
                variant="ghost"
                onClick={() => {
                  const defaultFilters = {
                    kodeAds: "all",
                    sumberLeads: "all",
                    layananAssist: "all",
                    statusLeads: "all",
                    periodeWaktu: "all",
                    customStartDate: "",
                    customEndDate: ""
                  };
                  setFilters(defaultFilters);
                  setAppliedFilters(defaultFilters);
                  setCurrentPage(1);
                }}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-200 px-4 py-2 h-auto text-sm font-medium rounded-lg border border-blue-300 bg-white shadow-sm shrink-0 transition-all duration-200"
              >
                ✕ Hapus semua filter
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

        {/* Table Container - Modern style matching Data Master User */}
        <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
          {/* Table Header */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-900">Data Prospek</h3>
                  <p className="text-sm text-slate-600">Kelola data prospek leads yang masuk</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-sm text-slate-500">
                  Total: <span className="font-medium text-slate-900">{filteredProspects.length}</span> prospek
                </div>
                <Button 
                  onClick={() => router.push('/tambah-prospek')}
                  className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white h-9 px-4 whitespace-nowrap shrink-0"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Tambah Prospek
                </Button>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 hover:bg-gradient-to-r hover:from-slate-50 hover:to-slate-100">
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>Created Date</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-slate-500" />
                      <span>Tanggal Prospek</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Target className="h-4 w-4 text-slate-500" />
                      <span>Sumber Leads</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-slate-500" />
                      <span>Kode Ads</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <span>ID Ads</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-slate-500" />
                      <span>Nama Prospek</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-slate-500" />
                      <span>WhatsApp</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-4 w-4 text-slate-500" />
                      <span>Status Leads</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <span>Layanan Assist</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-slate-500" />
                      <span>Nama Faskes</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <Building className="h-4 w-4 text-slate-500" />
                      <span>Tipe Faskes</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-slate-500" />
                      <span>Lokasi Faskes</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                    <div className="flex items-center gap-2">
                      <span>PIC Leads</span>
                    </div>
                  </TableHead>
                  <TableHead className="py-4 px-6 text-center font-semibold text-slate-700">
                    <div className="flex items-center justify-center gap-2">
                      <span>Aksi</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProspects.length > 0 ? (
                  currentProspects.map((prospect, index) => (
                    <TableRow key={prospect.id} className="transition-all duration-200 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <div className="text-slate-700">{prospect.createdDate}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <div className="text-slate-700">{prospect.prospectDate}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <Badge 
                          variant="outline" 
                          className="text-xs rounded-full border-slate-300 bg-slate-50 text-slate-700 font-medium px-3 py-1"
                        >
                          {prospect.leadSource}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <div className="font-mono text-xs text-slate-600">{prospect.adsCode}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <div className="font-mono text-xs text-slate-600">{prospect.adsId}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                            {prospect.prospectName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900">{prospect.prospectName}</div>
                            <div className="text-sm text-slate-500">ID: {prospect.id}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <a 
                          href={`https://wa.me/${prospect.whatsappNumber.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center text-green-600 hover:text-green-700 transition-colors"
                        >
                          <Phone className="h-4 w-4 mr-2" />
                          <span className="text-sm">{prospect.whatsappNumber}</span>
                        </a>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        {getStatusBadge(prospect.leadStatus)}
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <Badge 
                          variant="secondary" 
                          className="text-xs rounded-full bg-blue-50 text-blue-700 border-blue-200 font-medium px-3 py-1"
                        >
                          {prospect.assistService}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <div className="font-medium text-slate-900">{prospect.faskesName}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-slate-400" />
                          <span className="text-sm text-slate-700">{prospect.faskesType}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2 text-slate-400" />
                          <span className="text-sm text-slate-700">{prospect.faskesLocation}</span>
                        </div>
                      </TableCell>
                      <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                        <div className="text-slate-700">{prospect.picLead}</div>
                      </TableCell>
                      <TableCell className="py-4 px-6">
                        <div className="flex items-center justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDetailModal(prospect)}
                            className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 rounded-lg"
                            title="Lihat Detail"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => router.push(`/edit-prospek/${prospect.id}`)}
                            className="h-8 w-8 p-0 hover:bg-yellow-50 hover:text-yellow-600 rounded-lg"
                            title="Edit Prospek"
                          >
                            <Edit3 className="h-4 w-4" />
                          </Button>
                          {/* Tombol Konversi ke Customer - hanya aktif untuk status "Leads" */}
                          {(() => {
                            const isLeadsStatus = prospect.leadStatus === "Leads";
                            const isCustomer = prospect.leadStatus === "Customer";
                            
                            // Jika Customer, tampilkan button detail customer
                            if (isCustomer) {
                              return (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  onClick={() => openCustomerDetail(prospect)}
                                  className="h-8 w-8 p-0 rounded-lg transition-all duration-200 hover:bg-blue-50 hover:text-blue-600 text-blue-600"
                                  title="Lihat Detail Customer & Langganan"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              );
                            }
                            
                            return (
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={isLeadsStatus ? () => openConversionConfirmModal(prospect) : undefined}
                                disabled={!isLeadsStatus}
                                className={`h-8 w-8 p-0 rounded-lg transition-all duration-200 ${
                                  isLeadsStatus 
                                    ? 'hover:bg-emerald-50 hover:text-emerald-600 text-emerald-600' 
                                    : 'text-slate-400 cursor-not-allowed bg-slate-50'
                                }`}
                                title={
                                  isLeadsStatus 
                                    ? "Konversi ke Customer" 
                                    : `Konversi hanya tersedia untuk status "Leads". Status saat ini: "${prospect.leadStatus}"`
                                }
                              >
                                <UserCheck className="h-4 w-4" />
                              </Button>
                            );
                          })()}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => openDeleteModal(prospect)}
                            className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700 rounded-lg"
                            title="Hapus Prospek"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={14} className="py-12 text-center">
                      <div className="flex flex-col items-center justify-center text-slate-500">
                        <div className="p-4 bg-slate-100 rounded-full mb-4">
                          <Users className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-lg font-medium text-slate-600 mb-1">Tidak ada data prospek ditemukan</p>
                        <p className="text-sm text-slate-500">Coba ubah kata kunci pencarian atau tambah data prospek baru</p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>

          {/* Pagination */}
          <div className="flex flex-col lg:flex-row justify-between items-center py-6 px-6 bg-slate-50 border-t border-slate-200 gap-4">
            <div className="text-sm text-slate-600 order-2 lg:order-1">
              Menampilkan <span className="font-medium">{startIndex + 1}</span> hingga <span className="font-medium">{Math.min(endIndex, totalItems)}</span> dari <span className="font-medium">{totalItems}</span> data
            </div>
            
            <div className="flex items-center gap-2 order-1 lg:order-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className="flex items-center px-3 py-2 h-9 text-sm disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Sebelumnya
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  let page;
                  if (totalPages <= 5) {
                    page = i + 1;
                  } else if (currentPage <= 3) {
                    page = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    page = totalPages - 4 + i;
                  } else {
                    page = currentPage - 2 + i;
                  }
                  
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-full text-sm font-medium ${
                        currentPage === page 
                          ? 'bg-gradient-to-r from-blue-600 to-blue-500 text-white border-blue-600 hover:from-blue-700 hover:to-blue-600' 
                          : 'hover:bg-slate-100'
                      }`}
                    >
                      {page}
                    </Button>
                  );
                })}
              </div>
              
              <Button 
                variant="outline" 
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="flex items-center px-3 py-2 h-9 text-sm disabled:opacity-50"
              >
                Selanjutnya
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        </div>

      {/* Detail Modal */}
      {showDetailModal && selectedProspect && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          onClick={closeDetailModal}
        >
          <div 
            className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Detail Prospek</h2>
                  <p className="text-blue-100 mt-1">Informasi lengkap data prospek</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeDetailModal}
                  className="text-white hover:bg-blue-700 rounded-full h-10 w-10 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-8">
              {/* Informasi Prospek */}
              <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Users className="h-5 w-5 mr-2 text-blue-600" />
                  Informasi Prospek
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Nama Prospek</label>
                      <p className="text-lg font-semibold text-slate-900">{selectedProspect.prospectName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">No WhatsApp</label>
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-2 text-green-600" />
                        <a 
                          href={`https://wa.me/${selectedProspect.whatsappNumber.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-600 hover:text-green-700 font-medium"
                        >
                          {selectedProspect.whatsappNumber}
                        </a>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">E-mail</label>
                      <div className="flex items-center">
                        <svg className="h-4 w-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.44a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <a 
                          href={`mailto:${selectedProspect.email}`}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          {selectedProspect.email}
                        </a>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Tanggal Prospek Masuk</label>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                        <p className="text-slate-900">{selectedProspect.prospectDate}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Status Leads</label>
                      <div className="mt-2">
                        {getStatusBadge(selectedProspect.leadStatus)}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">PIC Leads</label>
                      <p className="text-slate-900 font-medium">{selectedProspect.picLead}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Created Date</label>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                        <p className="text-slate-900">{selectedProspect.createdDate}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Leads */}
              <div className="bg-gradient-to-r from-green-50 to-emerald-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Target className="h-5 w-5 mr-2 text-green-600" />
                  Data Leads
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Sumber Leads</label>
                      <Badge variant="outline" className="text-sm font-medium bg-white border-slate-300">
                        {selectedProspect.leadSource}
                      </Badge>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Kode Ads</label>
                      <p className="text-slate-900 font-mono text-sm bg-white px-3 py-2 rounded-lg border border-slate-200">
                        {selectedProspect.adsCode}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">ID Ads</label>
                      <p className="text-slate-900 font-mono text-sm bg-white px-3 py-2 rounded-lg border border-slate-200">
                        {selectedProspect.adsId}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Layanan Assist</label>
                      <Badge variant="secondary" className="text-sm font-medium bg-blue-100 text-blue-700 border-blue-200">
                        {selectedProspect.assistService}
                      </Badge>
                    </div>
                    {selectedProspect.leadStatus === "Bukan Leads" && selectedProspect.bukanLeadsReason && (
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Keterangan Bukan Leads</label>
                        <p className="text-slate-900 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                          {selectedProspect.bukanLeadsReason}
                        </p>
                      </div>
                    )}
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Keterangan</label>
                      <p className="text-slate-900 bg-white px-3 py-2 rounded-lg border border-slate-200 leading-relaxed">
                        {selectedProspect.description}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Additional Information - Keterangan */}
                {selectedProspect.keterangan && (
                  <div className="mt-6 bg-gradient-to-r from-amber-50 to-yellow-100 rounded-xl p-6">
                    <h4 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                      <FileText className="h-5 w-5 mr-2 text-amber-600" />
                      Keterangan Tambahan
                    </h4>
                    <p className="text-slate-900 bg-white px-4 py-3 rounded-lg border border-amber-200 leading-relaxed">
                      {selectedProspect.keterangan}
                    </p>
                  </div>
                )}
              </div>

              {/* Data Faskes */}
              <div className="bg-gradient-to-r from-purple-50 to-indigo-100 rounded-xl p-6">
                <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                  <Building className="h-5 w-5 mr-2 text-purple-600" />
                  Data Faskes
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Nama Faskes</label>
                      <p className="text-lg font-semibold text-slate-900">{selectedProspect.faskesName}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Tipe Faskes</label>
                      <div className="flex items-center">
                        <Building className="h-4 w-4 mr-2 text-slate-500" />
                        <p className="text-slate-900 font-medium">{selectedProspect.faskesType}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Provinsi</label>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                        <p className="text-slate-900">{selectedProspect.faskesProvinsi}</p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Kota/Kabupaten</label>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-slate-500" />
                        <p className="text-slate-900">{selectedProspect.faskesKota}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Customer - Only show if leadStatus is "Customer" */}
              {selectedProspect.leadStatus === "Customer" && konversiData && konversiData.length > 0 && (
                <div className="bg-gradient-to-r from-emerald-50 to-teal-100 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                    <svg className="h-5 w-5 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Informasi Customer
                  </h3>
                  
                  <div className="space-y-4">
                    {/* Tanggal Konversi & Total Nilai Transaksi */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Tanggal Konversi</label>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-emerald-600" />
                          <p className="text-slate-900 font-medium">
                            {konversiData[0]?.tanggalKonversi ? new Date(konversiData[0].tanggalKonversi).toLocaleDateString('id-ID', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            }) : '-'}
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-600 mb-1">Total Nilai Transaksi</label>
                        <div className="flex items-center">
                          <svg className="h-4 w-4 mr-2 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-lg font-bold text-emerald-700">
                            Rp {calculateTotalLTV(konversiData).toLocaleString('id-ID')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Layanan & Produk yang Dibeli */}
                    {konversiData[0]?.konversi_customer_item && konversiData[0].konversi_customer_item.length > 0 && (
                      <div className="mt-6">
                        <label className="block text-sm font-medium text-slate-600 mb-3">Layanan & Produk yang Dibeli</label>
                        <div className="space-y-3">
                          {konversiData[0].konversi_customer_item.map((item, index) => (
                            <div key={index} className="bg-white rounded-lg border border-emerald-200 p-4">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                  <p className="text-xs text-slate-500 mb-1">Layanan</p>
                                  <Badge variant="secondary" className="text-sm font-medium bg-blue-100 text-blue-700">
                                    {item.layanan?.nama || '-'}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 mb-1">Produk</p>
                                  <Badge variant="secondary" className="text-sm font-medium bg-purple-100 text-purple-700">
                                    {item.produk?.nama || '-'}
                                  </Badge>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500 mb-1">Nilai Transaksi</p>
                                  <p className="text-sm font-bold text-slate-900">
                                    Rp {item.nilaiTransaksi ? item.nilaiTransaksi.toLocaleString('id-ID') : '0'}
                                  </p>
                                </div>
                              </div>
                              <div className="mt-3 pt-3 border-t border-slate-200">
                                <p className="text-xs text-slate-500 mb-1">Durasi Langganan</p>
                                <p className="text-sm font-medium text-slate-900">
                                  {item.durasiLangganan} {item.tipeDurasi}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Keterangan */}
                    {konversiData[0]?.keterangan && (
                      <div className="mt-4">
                        <label className="block text-sm font-medium text-slate-600 mb-2">Keterangan Konversi</label>
                        <p className="text-slate-900 bg-white px-4 py-3 rounded-lg border border-emerald-200 leading-relaxed">
                          {konversiData[0].keterangan}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-slate-50 border-t border-slate-200 p-6 rounded-b-2xl">
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={closeDetailModal}
                  className="px-6 py-2"
                >
                  Tutup
                </Button>
                <Button
                  onClick={() => {
                    closeDetailModal();
                    // Navigate to edit page if needed
                    // router.push(`/edit-prospek/${selectedProspect.id}`);
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white"
                >
                  <Edit3 className="h-4 w-4 mr-2" />
                  Edit Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && prospectToDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            // Close modal when clicking backdrop
            if (e.target === e.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    Konfirmasi Hapus Data
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Tindakan ini tidak dapat dibatalkan
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 pb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-slate-900 mb-2">
                  Apakah Anda yakin ingin menghapus data prospek ini?
                </p>
                <div className="bg-white border border-red-200 rounded-lg p-3">
                  <p className="font-semibold text-slate-900">{prospectToDelete.prospectName}</p>
                  <p className="text-sm text-slate-600">{prospectToDelete.faskesName}</p>
                  <p className="text-sm text-slate-500">{prospectToDelete.whatsappNumber}</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 text-yellow-600 mt-0.5">⚠️</div>
                  <div>
                    <p className="text-sm font-medium text-yellow-800 mb-1">Peringatan</p>
                    <p className="text-sm text-yellow-700">
                      Data yang dihapus tidak dapat dikembalikan. Pastikan Anda telah mempertimbangkan keputusan ini dengan baik.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={closeDeleteModal}
                  className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleDeleteProspect}
                  className="px-6 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Hapus Data
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Confirmation Modal */}
      {showConversionConfirmModal && prospectToConvert && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeConversionConfirmModal();
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="p-6 pb-4">
              <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <UserCheck className="h-6 w-6 text-emerald-600" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-slate-900">
                    Konversi ke Customer
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Konfirmasi konversi prospek menjadi customer
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 pb-6">
              <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 mb-6">
                <p className="text-slate-900 mb-2">
                  Apakah Anda yakin ingin mengkonversi data ini menjadi Customer?
                </p>
                {prospectToConvert.leadStatus !== "Leads" && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
                    <p className="text-red-700 text-sm font-medium">
                      ⚠️ Konversi hanya dapat dilakukan untuk prospek dengan status "Leads"
                    </p>
                  </div>
                )}
                <div className="bg-white border border-emerald-200 rounded-lg p-3">
                  <p className="font-semibold text-slate-900">{prospectToConvert.prospectName}</p>
                  <p className="text-sm text-slate-600">{prospectToConvert.faskesName}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600">Status Saat Ini:</span>
                      {getStatusBadge(prospectToConvert.leadStatus)}
                    </div>
                    {prospectToConvert.leadStatus === "Leads" ? (
                      <>
                        <ArrowRight className="h-4 w-4 text-emerald-500" />
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-slate-600">Akan Menjadi:</span>
                          {getStatusBadge("Customer")}
                        </div>
                      </>
                    ) : (
                      <div className="ml-2 text-xs text-red-600 font-medium">
                        (Harus status "Leads" untuk konversi)
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <div className="h-5 w-5 text-blue-600 mt-0.5">ℹ️</div>
                  <div>
                    <p className="text-sm font-medium text-blue-800 mb-1">Informasi</p>
                    <p className="text-sm text-blue-700">
                      Setelah konfirmasi, Anda akan diminta mengisi data nilai transaksi dan durasi langganan.
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={closeConversionConfirmModal}
                  className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </Button>
                <Button
                  onClick={openConversionFormModal}
                  disabled={prospectToConvert.leadStatus !== "Leads"}
                  className={`px-6 py-2 text-white transition-all duration-200 ${
                    prospectToConvert.leadStatus === "Leads"
                      ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                      : 'bg-slate-400 cursor-not-allowed'
                  }`}
                >
                  <UserCheck className="h-4 w-4 mr-2" />
                  {prospectToConvert.leadStatus === "Leads" ? "Ya, Lanjutkan" : "Tidak Dapat Dikonversi"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conversion Form Modal */}
      {showConversionFormModal && prospectToConvert && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeConversionFormModal();
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full mx-4 animate-in fade-in zoom-in duration-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold">Form Konversi Customer</h2>
                  <p className="text-emerald-100 mt-1">Lengkapi data transaksi dan durasi langganan</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={closeConversionFormModal}
                  className="text-white hover:bg-emerald-700 rounded-full h-10 w-10 p-0"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <form onSubmit={handleConversionSubmit} className="space-y-6">
                {/* Prospect Info (Read-only) */}
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <Users className="h-5 w-5 mr-2 text-slate-600" />
                    Informasi Prospek (Read-Only)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Nama Prospek</label>
                      <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700">
                        {prospectToConvert.prospectName}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Nama Faskes</label>
                      <div className="p-3 bg-white border border-slate-200 rounded-lg text-slate-700">
                        {prospectToConvert.faskesName}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-600 mb-1">Status Saat Ini</label>
                      <div className="p-3 bg-white border border-slate-200 rounded-lg">
                        {getStatusBadge(prospectToConvert.leadStatus)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Multiple Service-Product Items Section */}
                <div className="bg-gradient-to-r from-blue-50 to-indigo-100 rounded-xl p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center">
                      <Package className="h-5 w-5 mr-2 text-blue-600" />
                      Layanan & Produk Customer
                    </h3>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={addServiceProductItem}
                      className="bg-white hover:bg-blue-50 border-blue-200 text-blue-700"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Tambah Layanan/Produk
                    </Button>
                  </div>

                  {/* Render Multiple Service-Product Items */}
                  {conversionForm.serviceProductItems.map((item, index) => (
                    <div key={item.id} className="bg-white rounded-lg border border-blue-200 p-4 mb-4 last:mb-0">
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-medium text-slate-800">
                          Layanan & Produk #{index + 1}
                        </h4>
                        {conversionForm.serviceProductItems.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeServiceProductItem(item.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Service Selection */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Layanan <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={item.serviceId}
                            onValueChange={(value) => updateServiceProductItem(item.id, 'serviceId', value)}
                          >
                            <SelectTrigger className={`w-full ${conversionErrors[`serviceId_${item.id}`] ? 'border-red-500' : 'border-slate-300'}`}>
                              <SelectValue placeholder="Pilih layanan" />
                            </SelectTrigger>
                            <SelectContent>
                              {masterServices.map((service) => (
                                <SelectItem key={service.id} value={service.id.toString()}>
                                  <div>
                                    <div className="font-medium">{service.name}</div>
                                    <div className="text-xs text-slate-500">{service.description}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {conversionErrors[`serviceId_${item.id}`] && (
                            <p className="text-red-500 text-sm mt-1">{conversionErrors[`serviceId_${item.id}`]}</p>
                          )}
                        </div>

                        {/* Product Selection */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Produk <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={item.productId}
                            onValueChange={(value) => updateServiceProductItem(item.id, 'productId', value)}
                            disabled={!item.serviceId}
                          >
                            <SelectTrigger className={`w-full ${conversionErrors[`productId_${item.id}`] ? 'border-red-500' : 'border-slate-300'} ${!item.serviceId ? 'bg-slate-50 cursor-not-allowed' : ''}`}>
                              <SelectValue placeholder={!item.serviceId ? "Pilih layanan dulu" : "Pilih produk"} />
                            </SelectTrigger>
                            <SelectContent>
                              {getAvailableProducts(item.serviceId).map((product) => (
                                <SelectItem key={product.id} value={product.id.toString()}>
                                  <div>
                                    <div className="font-medium">{product.name}</div>
                                    <div className="text-xs text-slate-500">Layanan: {product.serviceName}</div>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {conversionErrors[`productId_${item.id}`] && (
                            <p className="text-red-500 text-sm mt-1">{conversionErrors[`productId_${item.id}`]}</p>
                          )}
                        </div>

                        {/* Transaction Value */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Nilai Transaksi <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="text"
                            placeholder="Contoh: 1000000 akan menjadi Rp 1.000.000"
                            value={formatRupiah(item.transactionValue)}
                            onChange={(e) => handleTransactionValueChange(item.id, e)}
                            className={`w-full ${conversionErrors[`transactionValue_${item.id}`] ? 'border-red-500' : 'border-slate-300'}`}
                          />
                          {conversionErrors[`transactionValue_${item.id}`] && (
                            <p className="text-red-500 text-sm mt-1">{conversionErrors[`transactionValue_${item.id}`]}</p>
                          )}
                        </div>

                        {/* Subscription Duration */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Durasi & Tipe Langganan <span className="text-red-500">*</span>
                          </label>
                          <div className="flex gap-2">
                            <Input
                              type="number"
                              min="1"
                              placeholder="Durasi"
                              value={item.subscriptionDuration}
                              onChange={(e) => updateServiceProductItem(item.id, 'subscriptionDuration', e.target.value)}
                              className={`flex-1 ${conversionErrors[`subscriptionDuration_${item.id}`] ? 'border-red-500' : 'border-slate-300'}`}
                            />
                            <Select
                              value={item.durationType}
                              onValueChange={(value) => updateServiceProductItem(item.id, 'durationType', value)}
                            >
                              <SelectTrigger className="w-24">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="months">Bulan</SelectItem>
                                <SelectItem value="years">Tahun</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          {conversionErrors[`subscriptionDuration_${item.id}`] && (
                            <p className="text-red-500 text-sm mt-1">{conversionErrors[`subscriptionDuration_${item.id}`]}</p>
                          )}
                        </div>

                        {/* Start Date */}
                        <div>
                          <label className="block text-sm font-medium text-slate-700 mb-2">
                            Tanggal Mulai Berlangganan <span className="text-red-500">*</span>
                          </label>
                          <Input
                            type="date"
                            value={item.startDate}
                            onChange={(e) => updateServiceProductItem(item.id, 'startDate', e.target.value)}
                            className={`w-full ${conversionErrors[`startDate_${item.id}`] ? 'border-red-500' : 'border-slate-300'}`}
                          />
                          {conversionErrors[`startDate_${item.id}`] && (
                            <p className="text-red-500 text-sm mt-1">{conversionErrors[`startDate_${item.id}`]}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form Notes & Information */}
                <div className="bg-gradient-to-r from-emerald-50 to-green-100 rounded-xl p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center">
                    <DollarSign className="h-5 w-5 mr-2 text-emerald-600" />
                    Informasi Konversi
                  </h3>

                  {/* Form Note */}
                  <div className="p-4 bg-white border border-emerald-200 rounded-lg mb-4">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 text-emerald-600 mt-0.5">💡</div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 mb-1">Catatan Penting</p>
                        <ul className="text-sm text-slate-700 space-y-1">
                          <li>• <strong>Konversi hanya dapat dilakukan untuk status "Leads"</strong></li>
                          <li>• Semua field dengan tanda (*) wajib diisi untuk setiap layanan/produk</li>
                          <li>• <strong>Nilai transaksi otomatis format rupiah</strong> (misal: 1000000 → Rp 1.000.000)</li>
                          <li>• Nilai minimum transaksi: Rp 1.000</li>
                          <li>• <strong>Dapat menambahkan multiple layanan dan produk</strong></li>
                          <li>• <strong>Kombinasi layanan-produk tidak boleh duplikat</strong></li>
                          <li>• Setelah konversi, status akan berubah menjadi "Customer"</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Preview */}
                  <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 text-blue-600 mt-0.5">📋</div>
                      <div>
                        <p className="text-sm font-medium text-slate-900 mb-2">Yang Akan Terjadi Setelah Konversi:</p>
                        <ul className="text-sm text-slate-700 space-y-1">
                          <li>• Status prospek otomatis berubah dari "{prospectToConvert.leadStatus}" → "Customer"</li>
                          <li>• Semua data layanan/produk dan transaksi tersimpan dalam sistem</li>
                          <li>• Data konversi dapat dilihat di laporan dan analytics</li>
                          <li>• Notifikasi sukses akan ditampilkan setelah proses selesai</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={closeConversionFormModal}
                    className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={!isFormComplete() || isConverting}
                    className={`px-6 py-2 text-white transition-all duration-200 ${
                      isFormComplete() && !isConverting
                        ? 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800'
                        : 'bg-slate-400 cursor-not-allowed'
                    }`}
                  >
                    {isConverting ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <UserCheck className="h-4 w-4 mr-2" />
                    )}
                    {isConverting 
                      ? 'Memproses Konversi...'
                      : isFormComplete()
                        ? `Simpan & Konversi ${conversionForm.serviceProductItems.length} Layanan/Produk`
                        : 'Lengkapi Semua Field Wajib'
                    }
                  </Button>
                  
                  {/* Status Indicator */}
                  <div className="text-center">
                    <p className="text-xs text-slate-500 mt-2">
                      {isConverting ? (
                        <span className="text-blue-600 font-medium">🔄 Sedang memproses konversi data...</span>
                      ) : isFormComplete() ? (
                        <span className="text-emerald-600 font-medium">
                          ✓ Semua {conversionForm.serviceProductItems.length} item layanan/produk siap dikonversi
                        </span>
                      ) : (
                        <span className="text-amber-600 font-medium">
                          ⚠️ Lengkapi semua field yang bertanda (*) untuk {conversionForm.serviceProductItems.length} item
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Notification Toast */}
      {notification && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-8 md:pt-16 px-4 pointer-events-none">
          <div className="pointer-events-auto animate-in slide-in-from-top-4 fade-in zoom-in duration-300">
            <div className={`
              w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto shadow-2xl rounded-2xl border-2 backdrop-blur-sm
              ${notification.type === 'success' 
                ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-400 shadow-green-200/50' 
                : 'bg-gradient-to-r from-red-50 to-rose-50 border-red-400 shadow-red-200/50'
              }
            `}>
              {/* Header with colored stripe */}
              <div className={`
                h-2 w-full rounded-t-2xl
                ${notification.type === 'success' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-red-500 to-rose-500'
                }
              `}></div>
              
              {/* Main content */}
              <div className="px-6 sm:px-8 py-5 sm:py-6">
                <div className="flex items-start gap-3 sm:gap-4">
                  {/* Icon */}
                  <div className={`
                    flex-shrink-0 p-2 sm:p-3 rounded-full shadow-lg
                    ${notification.type === 'success' 
                      ? 'bg-green-100 ring-2 ring-green-300' 
                      : 'bg-red-100 ring-2 ring-red-300'
                    }
                  `}>
                    {notification.type === 'success' ? (
                      <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-green-600" />
                    ) : (
                      <AlertCircle className="h-6 w-6 sm:h-8 sm:w-8 text-red-600" />
                    )}
                  </div>
                  
                  {/* Message content */}
                  <div className="flex-1 min-w-0 pt-0.5 sm:pt-1">
                    <div className={`
                      text-base sm:text-lg lg:text-xl font-bold mb-1 sm:mb-2
                      ${notification.type === 'success' ? 'text-green-900' : 'text-red-900'}
                    `}>
                      {notification.type === 'success' ? 'Berhasil!' : 'Terjadi Kesalahan!'}
                    </div>
                    <p className={`
                      text-sm sm:text-base lg:text-lg font-medium leading-relaxed
                      ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'}
                    `}>
                      {notification.message}
                    </p>
                  </div>
                  
                  {/* Close button */}
                  <div className="flex-shrink-0">
                    <button
                      className={`
                        p-1.5 sm:p-2 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 hover:scale-105
                        ${notification.type === 'success' 
                          ? 'text-green-600 hover:bg-green-100 focus:ring-green-500 hover:text-green-700' 
                          : 'text-red-600 hover:bg-red-100 focus:ring-red-500 hover:text-red-700'
                        }
                      `}
                      onClick={() => setNotification(null)}
                      title="Tutup notifikasi"
                    >
                      <X className="h-5 w-5 sm:h-6 sm:w-6" />
                    </button>
                  </div>
                </div>
                
                {/* Enhanced progress bar */}
                <div className="mt-3 sm:mt-4 mb-1">
                  <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2 shadow-inner">
                    <div 
                      className={`
                        h-1.5 sm:h-2 rounded-full shadow-sm transition-all
                        ${notification.type === 'success' 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                          : 'bg-gradient-to-r from-red-500 to-rose-500'
                        }
                      `}
                      style={{
                        animation: 'progressBar 3s linear forwards',
                        width: '100%'
                      }}
                    ></div>
                  </div>
                  <div className="flex justify-center mt-2">
                    <span className={`
                      text-xs sm:text-sm font-medium
                      ${notification.type === 'success' ? 'text-green-600' : 'text-red-600'}
                    `}>
                      Otomatis hilang dalam 3 detik
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customer Detail Modal */}
      {showCustomerDetailModal && selectedCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                    <UserCheck className="h-6 w-6 mr-2 text-emerald-600" />
                    Detail Customer & Langganan
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {selectedCustomer.faskesName} - {selectedCustomer.prospectName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowCustomerDetailModal(false)}
                  className="text-slate-400 hover:text-slate-600 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              {/* Customer Info */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Informasi Customer</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-slate-600">Nama Prospek</label>
                    <p className="text-slate-900 font-semibold">{selectedCustomer.prospectName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">No WhatsApp</label>
                    <div className="flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-green-600" />
                      <a 
                        href={`https://wa.me/${selectedCustomer.whatsappNumber.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-600 hover:text-green-700 font-medium"
                      >
                        {selectedCustomer.whatsappNumber}
                      </a>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">E-mail</label>
                    <p className="text-slate-900">{selectedCustomer.email || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Layanan Assist</label>
                    <p className="text-slate-900">{selectedCustomer.assistService || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Nama Faskes</label>
                    <p className="text-slate-900">{selectedCustomer.faskesName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Tipe Faskes</label>
                    <p className="text-slate-900">{selectedCustomer.faskesType}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Lokasi</label>
                    <p className="text-slate-900">{selectedCustomer.faskesProvinsi}, {selectedCustomer.faskesKota}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Tanggal Konversi</label>
                    <p className="text-slate-900">
                      {customerKonversiData && customerKonversiData.length > 0 
                        ? formatDate(customerKonversiData[0].tanggalKonversi) 
                        : '-'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">Total LTV</label>
                    <p className="text-slate-900 font-semibold text-emerald-600">
                      {customerKonversiData && customerKonversiData.length > 0
                        ? formatRupiah(calculateTotalLTV(customerKonversiData).toString())
                        : 'Rp 0'}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-slate-600">PIC Leads</label>
                    <p className="text-slate-900">{selectedCustomer.picLead || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Subscription List */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-slate-900">Daftar Langganan</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setProspectToConvert(selectedCustomer);
                      setShowCustomerDetailModal(false);
                      openConversionFormModal();
                    }}
                    className="bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Tambah Layanan/Produk
                  </Button>
                </div>

                {loadingCustomerKonversi ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto"></div>
                    <p className="text-slate-500 mt-3">Memuat data langganan...</p>
                  </div>
                ) : customerKonversiData && customerKonversiData.length > 0 ? (
                  <div className="space-y-4">
                    {customerKonversiData
                      .sort((a, b) => new Date(b.tanggalKonversi).getTime() - new Date(a.tanggalKonversi).getTime())
                      .map((konversi, konversiIndex) => {
                        // Check if any item in this konversi is expired
                        const hasExpiredItem = konversi.konversi_customer_item?.some(item => {
                          const startDate = new Date(konversi.tanggalKonversi);
                          let endDate = new Date(startDate);
                          if (item.tipeDurasi === 'months') {
                            endDate.setMonth(endDate.getMonth() + item.durasiLangganan);
                          } else if (item.tipeDurasi === 'years') {
                            endDate.setFullYear(endDate.getFullYear() + item.durasiLangganan);
                          }
                          return checkSubscriptionStatus(endDate.toISOString().split('T')[0]) === 'expired';
                        });
                        
                        return (
                          <div key={konversi.id || konversiIndex} className={`border rounded-lg p-4 ${
                            hasExpiredItem ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'
                          }`}>
                            <div className="flex justify-between items-start mb-4">
                              <div>
                                <div className="flex items-center gap-3 mb-2">
                                  <h4 className="font-semibold text-slate-900 text-lg">
                                    Transaksi #{konversi.id}
                                  </h4>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                    hasExpiredItem
                                      ? 'bg-red-100 text-red-700 border border-red-200' 
                                      : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                  }`}>
                                    {hasExpiredItem ? 'Expired' : 'Aktif'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                  <div>
                                    <span className="text-slate-600">Tanggal Transaksi:</span>
                                    <p className="font-semibold text-slate-900">
                                      {formatDate(konversi.tanggalKonversi)}
                                    </p>
                                  </div>
                                  <div>
                                    <span className="text-slate-600">Total Nilai:</span>
                                    <p className="font-semibold text-emerald-700">
                                      {formatRupiah(konversi.totalNilaiTransaksi?.toString() || '0')}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* List of Items/Layanan in this konversi */}
                            <div className="space-y-3">
                              <h5 className="font-medium text-slate-700 text-sm">Layanan & Produk:</h5>
                              {konversi.konversi_customer_item?.map((item, itemIndex) => {
                                const startDate = new Date(konversi.tanggalKonversi);
                                let endDate = new Date(startDate);
                                if (item.tipeDurasi === 'months') {
                                  endDate.setMonth(endDate.getMonth() + item.durasiLangganan);
                                } else if (item.tipeDurasi === 'years') {
                                  endDate.setFullYear(endDate.getFullYear() + item.durasiLangganan);
                                }
                                const isExpired = checkSubscriptionStatus(endDate.toISOString().split('T')[0]) === 'expired';

                                return (
                                  <div key={item.id || itemIndex} className="bg-white rounded-lg border border-slate-200 p-3">
                                    <div className="flex items-center gap-2 mb-2">
                                      <h6 className="font-medium text-slate-900">
                                        {item.layanan?.nama || '-'} - {item.produk?.nama || '-'}
                                      </h6>
                                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                        isExpired
                                          ? 'bg-red-100 text-red-700' 
                                          : 'bg-emerald-100 text-emerald-700'
                                      }`}>
                                        {isExpired ? 'Expired' : 'Aktif'}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                                      <div>
                                        <span className="text-slate-500">Nilai:</span>
                                        <p className="font-semibold text-slate-900">
                                          {formatRupiah(item.nilaiTransaksi?.toString() || '0')}
                                        </p>
                                      </div>
                                      <div>
                                        <span className="text-slate-500">Durasi:</span>
                                        <p className="font-semibold text-slate-900">
                                          {item.durasiLangganan} {item.tipeDurasi === 'months' ? 'Bulan' : 'Tahun'}
                                        </p>
                                      </div>
                                      <div className="col-span-2">
                                        <span className="text-slate-500">Periode:</span>
                                        <p className="font-semibold text-slate-900">
                                          {formatDate(startDate.toISOString().split('T')[0])} - {formatDate(endDate.toISOString().split('T')[0])}
                                        </p>
                                      </div>
                                    </div>
                                    {isExpired && (
                                      <div className="mt-2 pt-2 border-t border-slate-200">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => openRenewalModal(selectedCustomer, {
                                            id: item.id,
                                            serviceName: item.layanan?.nama,
                                            productName: item.produk?.nama,
                                            transactionValue: item.nilaiTransaksi,
                                            subscriptionDuration: item.durasiLangganan,
                                            durationType: item.tipeDurasi,
                                            startDate: startDate.toISOString().split('T')[0],
                                            endDate: endDate.toISOString().split('T')[0],
                                            conversionDate: konversi.tanggalKonversi
                                          })}
                                          className="w-full bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                                        >
                                          <RefreshCw className="h-3 w-3 mr-1" />
                                          Perpanjang Langganan
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>

                            {konversi.keterangan && (
                              <div className="mt-3 pt-3 border-t border-slate-300">
                                <span className="text-xs text-slate-500">Keterangan:</span>
                                <p className="text-sm text-slate-700 mt-1">{konversi.keterangan}</p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                    <p className="text-slate-500">Belum ada data langganan</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Renewal Modal */}
      {showRenewalModal && selectedSubscription && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h2 className="text-xl font-bold text-slate-900 flex items-center">
                    <RefreshCw className="h-5 w-5 mr-2 text-orange-600" />
                    Perpanjang Langganan
                  </h2>
                  <p className="text-slate-600 mt-1">
                    {selectedSubscription.serviceName} - {selectedSubscription.productName}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowRenewalModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <form onSubmit={handleRenewalSubmit}>
                <div className="space-y-4">
                  {/* Previous Subscription Info */}
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h3 className="font-medium text-slate-900 mb-2">Langganan Sebelumnya</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-600">Periode:</span>
                        <p className="font-medium">{formatDate(selectedSubscription.startDate)} - {formatDate(selectedSubscription.endDate)}</p>
                      </div>
                      <div>
                        <span className="text-slate-600">Nilai:</span>
                        <p className="font-medium">{formatRupiah(selectedSubscription.transactionValue.toString())}</p>
                      </div>
                    </div>
                  </div>

                  {/* New Renewal Form */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Durasi Baru <span className="text-red-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          min="1"
                          placeholder="Durasi"
                          value={renewalForm.duration}
                          onChange={(e) => {
                            setRenewalForm(prev => ({...prev, duration: e.target.value}));
                            if (renewalErrors['duration']) {
                              setRenewalErrors(prev => ({...prev, duration: ''}));
                            }
                          }}
                          className={`flex-1 ${renewalErrors['duration'] ? 'border-red-500' : ''}`}
                        />
                        <Select
                          value={renewalForm.durationType}
                          onValueChange={(value) => setRenewalForm(prev => ({...prev, durationType: value}))}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="months">Bulan</SelectItem>
                            <SelectItem value="years">Tahun</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      {renewalErrors['duration'] && (
                        <p className="text-red-500 text-sm mt-1">{renewalErrors['duration']}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nilai Transaksi <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="text"
                        placeholder="Nilai transaksi"
                        value={formatRupiah(renewalForm.transactionValue)}
                        onChange={handleRenewalTransactionChange}
                        className={renewalErrors['transactionValue'] ? 'border-red-500' : ''}
                      />
                      {renewalErrors['transactionValue'] && (
                        <p className="text-red-500 text-sm mt-1">{renewalErrors['transactionValue']}</p>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Tanggal Mulai <span className="text-red-500">*</span>
                      </label>
                      <Input
                        type="date"
                        value={renewalForm.startDate}
                        onChange={(e) => {
                          setRenewalForm(prev => ({...prev, startDate: e.target.value}));
                          if (renewalErrors['startDate']) {
                            setRenewalErrors(prev => ({...prev, startDate: ''}));
                          }
                        }}
                        className={renewalErrors['startDate'] ? 'border-red-500' : ''}
                      />
                      {renewalErrors['startDate'] && (
                        <p className="text-red-500 text-sm mt-1">{renewalErrors['startDate']}</p>
                      )}
                      <p className="text-sm text-slate-500 mt-1">
                        💡 Default: tanggal berakhir langganan sebelumnya
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-6 pt-4 border-t border-slate-200">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowRenewalModal(false)}
                    className="flex-1"
                    disabled={isProcessingRenewal}
                  >
                    Batal
                  </Button>
                  <Button
                    type="submit"
                    disabled={isProcessingRenewal}
                    className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                  >
                    {isProcessingRenewal ? (
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <RefreshCw className="h-4 w-4 mr-2" />
                    )}
                    {isProcessingRenewal ? 'Memproses...' : 'Perpanjang Langganan'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
