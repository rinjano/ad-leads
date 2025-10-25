"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/contexts/AuthContext';
import { useSumberLeads } from '@/hooks/useSumberLeads';
import { useKodeAds } from '@/hooks/useKodeAds';
import { useStatusLeads } from '@/hooks/useStatusLeads';
import { useBukanLeads } from '@/hooks/useBukanLeads';
import { useLayanan } from '@/hooks/useLayanan';
import { useTipeFaskes } from '@/hooks/useTipeFaskes';
import { useCreateProspek } from '@/hooks/useProspek';
import { MultiSelectDropdown } from '@/components/MultiSelectDropdown';

export default function TambahProspekPage() {
  const router = useRouter();
  const { appUser } = useAuth();
  
  // Set default date to current date in UTC+7
  const getCurrentDateUTC7 = () => {
    const now = new Date();
    const utc7 = new Date(now.getTime() + (7 * 60 * 60 * 1000));
    return utc7.toISOString().split('T')[0];
  };

  // Get user name for PIC Leads
  const getUserName = () => {
    if (!appUser) return '';
    return appUser.name || appUser.email.split('@')[0];
  };

  const [formData, setFormData] = useState({
    tanggalProspek: getCurrentDateUTC7(),
    tanggalJadiLeads: "", // New field
    sumberLeads: "",
    kodeAds: "",
    idAds: "",
    namaProspek: "",
    noWhatsApp: "",
    email: "",
    statusLeads: "",
    bukanLeads: "",
    keteranganBukanLeads: "",
    layananAssist: [] as string[], // Changed to array for multi-select
    namaFaskes: "",
    tipeFaskes: "",
    provinsi: "",
    kota: "",
    picLeads: getUserName(),
    keterangan: ""
  });

  const [kotaList, setKotaList] = useState([]);
  const [loadingKota, setLoadingKota] = useState(false);
  const [kotaError, setKotaError] = useState("");
  
  // Validation state
  const [validationErrors, setValidationErrors] = useState([]);
  const [showValidationAlert, setShowValidationAlert] = useState(false);

  // Fetch data from Data Master using hooks
  const { data: sumberLeadsList = [], isLoading: loadingSumberLeads } = useSumberLeads();
  const { data: kodeAdsList = [], isLoading: loadingKodeAds } = useKodeAds();
  const { data: statusLeadsList = [], isLoading: loadingStatusLeads } = useStatusLeads();
  const { data: bukanLeadsList = [], isLoading: loadingBukanLeads } = useBukanLeads();
  const { data: layananList = [], isLoading: loadingLayanan } = useLayanan();
  const { data: tipeFaskesList = [], isLoading: loadingTipeFaskes } = useTipeFaskes();
  
  // Mutation for creating prospek
  const createProspekMutation = useCreateProspek();

  // Sort data alphabetically
  const sumberLeadsData = [...sumberLeadsList]
    .sort((a: any, b: any) => a.nama.localeCompare(b.nama))
    .map((item: any) => item.nama);

  const kodeAdsData = [...kodeAdsList]
    .sort((a: any, b: any) => a.kode.localeCompare(b.kode))
    .map((item: any) => item.kode);

  const statusLeadsData = [...statusLeadsList]
    .sort((a: any, b: any) => a.nama.localeCompare(b.nama))
    .map((item: any) => item.nama);

  const bukanLeadsData = [...bukanLeadsList]
    .sort((a: any, b: any) => a.nama.localeCompare(b.nama))
    .map((item: any) => item.nama);

  const layananAssistData = [...layananList]
    .sort((a: any, b: any) => a.nama.localeCompare(b.nama))
    .map((item: any) => item.nama);

  const tipeFaskesData = [...tipeFaskesList]
    .sort((a: any, b: any) => a.nama.localeCompare(b.nama))
    .map((item: any) => item.nama);

  // Complete Indonesian provinces data
  const provinsiData = [
    { id: "11", name: "Aceh" },
    { id: "12", name: "Sumatera Utara" },
    { id: "13", name: "Sumatera Barat" },
    { id: "14", name: "Riau" },
    { id: "15", name: "Jambi" },
    { id: "16", name: "Sumatera Selatan" },
    { id: "17", name: "Bengkulu" },
    { id: "18", name: "Lampung" },
    { id: "19", name: "Kepulauan Bangka Belitung" },
    { id: "21", name: "Kepulauan Riau" },
    { id: "31", name: "DKI Jakarta" },
    { id: "32", name: "Jawa Barat" },
    { id: "33", name: "Jawa Tengah" },
    { id: "34", name: "DI Yogyakarta" },
    { id: "35", name: "Jawa Timur" },
    { id: "36", name: "Banten" },
    { id: "51", name: "Bali" },
    { id: "52", name: "Nusa Tenggara Barat" },
    { id: "53", name: "Nusa Tenggara Timur" },
    { id: "61", name: "Kalimantan Barat" },
    { id: "62", name: "Kalimantan Tengah" },
    { id: "63", name: "Kalimantan Selatan" },
    { id: "64", name: "Kalimantan Timur" },
    { id: "65", name: "Kalimantan Utara" },
    { id: "71", name: "Sulawesi Utara" },
    { id: "72", name: "Sulawesi Tengah" },
    { id: "73", name: "Sulawesi Selatan" },
    { id: "74", name: "Sulawesi Tenggara" },
    { id: "75", name: "Gorontalo" },
    { id: "76", name: "Sulawesi Barat" },
    { id: "81", name: "Maluku" },
    { id: "82", name: "Maluku Utara" },
    { id: "91", name: "Papua Barat" },
    { id: "94", name: "Papua" },
    { id: "92", name: "Papua Barat Daya" },
    { id: "93", name: "Papua Selatan" },
    { id: "95", name: "Papua Tengah" },
    { id: "96", name: "Papua Pegunungan" }
  ];

  // Function to check if sumber leads contains "Ads"
  const isAdsSource = (sumberLeads) => {
    return sumberLeads.toLowerCase().includes('ads');
  };

  // Load cities based on selected province with multiple API fallbacks
  const loadKotaByProvinsi = async (provinsiName) => {
    if (!provinsiName) return;
    
    setLoadingKota(true);
    setKotaError("");
    setKotaList([]);

    // Find province ID from name
    const provinsi = provinsiData.find(p => p.name === provinsiName);
    if (!provinsi) {
      setKotaError("Provinsi tidak ditemukan");
      setLoadingKota(false);
      return;
    }

    try {
      // Primary API: Try to fetch from multiple sources
      let cities = await fetchCitiesFromAPIs(provinsi.id, provinsiName);
      
      if (cities && cities.length > 0) {
        setKotaList(cities);
        setKotaError("");
      } else {
        // If no cities found, show error message
        setKotaError(`Data kota/kabupaten belum tersedia untuk provinsi ${provinsiName}`);
        setKotaList([]);
      }
    } catch (error) {
      console.error("Error loading cities:", error);
      setKotaError(`Gagal memuat data kota/kabupaten untuk provinsi ${provinsiName}`);
      setKotaList([]);
    } finally {
      setLoadingKota(false);
    }
  };

  // Function to fetch cities from multiple APIs with fallback
  const fetchCitiesFromAPIs = async (provinsiId, provinsiName) => {
    // API 1: Try Indonesian regions API
    try {
      const response1 = await fetch(`https://ibnux.github.io/data-indonesia/kabupaten/${provinsiId}.json`);
      if (response1.ok) {
        const data = await response1.json();
        if (data && data.length > 0) {
          return data.map(city => city.nama);
        }
      }
    } catch (error) {
      console.log("API 1 failed, trying API 2...");
    }

    // API 2: Try alternative Indonesian API
    try {
      const response2 = await fetch(`https://dev.farizdotid.com/api/daerahindonesia/kota?id_provinsi=${provinsiId}`);
      if (response2.ok) {
        const data = await response2.json();
        if (data && data.kota_kabupaten && data.kota_kabupaten.length > 0) {
          return data.kota_kabupaten.map(city => city.nama);
        }
      }
    } catch (error) {
      console.log("API 2 failed, using fallback data...");
    }

    // Fallback: Use comprehensive local data
    const fallbackData = {
      "DKI Jakarta": [
        "Jakarta Pusat", "Jakarta Utara", "Jakarta Barat", "Jakarta Selatan", 
        "Jakarta Timur", "Kepulauan Seribu"
      ],
      "Jawa Barat": [
        "Bandung", "Bogor", "Depok", "Cimahi", "Bekasi", "Tasikmalaya", "Cirebon", 
        "Sukabumi", "Garut", "Cianjur", "Kuningan", "Majalengka", "Sumedang", 
        "Indramayu", "Subang", "Purwakarta", "Karawang", "Ciamis", "Banjar", 
        "Pangandaran", "Kabupaten Bandung", "Kabupaten Bogor", "Kabupaten Sukabumi", 
        "Kabupaten Cianjur", "Kabupaten Garut", "Kabupaten Tasikmalaya", 
        "Kabupaten Ciamis", "Kabupaten Kuningan", "Kabupaten Cirebon", 
        "Kabupaten Majalengka", "Kabupaten Sumedang", "Kabupaten Indramayu", 
        "Kabupaten Subang", "Kabupaten Purwakarta", "Kabupaten Karawang", 
        "Kabupaten Bekasi", "Kabupaten Bandung Barat"
      ],
      "Jawa Tengah": [
        "Semarang", "Surakarta", "Magelang", "Pekalongan", "Tegal", "Salatiga",
        "Kabupaten Cilacap", "Kabupaten Banyumas", "Kabupaten Purbalingga", 
        "Kabupaten Banjarnegara", "Kabupaten Kebumen", "Kabupaten Purworejo", 
        "Kabupaten Wonosobo", "Kabupaten Magelang", "Kabupaten Boyolali", 
        "Kabupaten Klaten", "Kabupaten Sukoharjo", "Kabupaten Wonogiri", 
        "Kabupaten Karanganyar", "Kabupaten Sragen", "Kabupaten Grobogan", 
        "Kabupaten Blora", "Kabupaten Rembang", "Kabupaten Pati", 
        "Kabupaten Kudus", "Kabupaten Jepara", "Kabupaten Demak", 
        "Kabupaten Semarang", "Kabupaten Temanggung", "Kabupaten Kendal", 
        "Kabupaten Batang", "Kabupaten Pekalongan", "Kabupaten Pemalang", 
        "Kabupaten Tegal", "Kabupaten Brebes"
      ],
      "DI Yogyakarta": [
        "Yogyakarta", "Kabupaten Sleman", "Kabupaten Bantul", 
        "Kabupaten Kulon Progo", "Kabupaten Gunung Kidul"
      ],
      "Jawa Timur": [
        "Surabaya", "Malang", "Kediri", "Blitar", "Mojokerto", "Madiun", 
        "Jember", "Batu", "Pasuruan", "Probolinggo", "Kabupaten Pacitan", 
        "Kabupaten Ponorogo", "Kabupaten Trenggalek", "Kabupaten Tulungagung", 
        "Kabupaten Blitar", "Kabupaten Kediri", "Kabupaten Malang", 
        "Kabupaten Lumajang", "Kabupaten Jember", "Kabupaten Banyuwangi", 
        "Kabupaten Bondowoso", "Kabupaten Situbondo", "Kabupaten Probolinggo", 
        "Kabupaten Pasuruan", "Kabupaten Sidoarjo", "Kabupaten Mojokerto", 
        "Kabupaten Jombang", "Kabupaten Nganjuk", "Kabupaten Madiun", 
        "Kabupaten Magetan", "Kabupaten Ngawi", "Kabupaten Bojonegoro", 
        "Kabupaten Tuban", "Kabupaten Lamongan", "Kabupaten Gresik", 
        "Kabupaten Bangkalan", "Kabupaten Sampang", "Kabupaten Pamekasan", 
        "Kabupaten Sumenep"
      ],
      "Banten": [
        "Serang", "Tangerang", "Cilegon", "Tangerang Selatan", 
        "Kabupaten Pandeglang", "Kabupaten Lebak", "Kabupaten Tangerang", 
        "Kabupaten Serang"
      ],
      "Bali": [
        "Denpasar", "Kabupaten Badung", "Kabupaten Gianyar", "Kabupaten Tabanan", 
        "Kabupaten Klungkung", "Kabupaten Bangli", "Kabupaten Karangasem", 
        "Kabupaten Buleleng", "Kabupaten Jembrana"
      ],
      "Sumatera Utara": [
        "Medan", "Pematangsiantar", "Sibolga", "Tanjungbalai", "Binjai", 
        "Tebing Tinggi", "Padangsidimpuan", "Gunungsitoli", "Kabupaten Deli Serdang", 
        "Kabupaten Langkat", "Kabupaten Karo", "Kabupaten Simalungun", 
        "Kabupaten Asahan", "Kabupaten Labuhanbatu", "Kabupaten Dairi", 
        "Kabupaten Toba Samosir", "Kabupaten Mandailing Natal", "Kabupaten Nias", 
        "Kabupaten Pakpak Bharat", "Kabupaten Humbang Hasundutan", 
        "Kabupaten Samosir", "Kabupaten Serdang Bedagai", "Kabupaten Batu Bara", 
        "Kabupaten Padang Lawas Utara", "Kabupaten Padang Lawas", 
        "Kabupaten Labuhanbatu Selatan", "Kabupaten Labuhanbatu Utara", 
        "Kabupaten Nias Utara", "Kabupaten Nias Barat", "Kabupaten Nias Selatan"
      ]
      // Add more provinces as needed
    };

    return fallbackData[provinsiName] || [];
  };

  // Handle province change
  useEffect(() => {
    if (formData.provinsi) {
      handleFormDataChange('kota', ''); // Reset city when province changes
        setKotaError(""); // Reset error state
        loadKotaByProvinsi(formData.provinsi);
      } else {
        // Clear city data when no province selected
        setKotaList([]);
        setKotaError("");
        setLoadingKota(false);
    }
  }, [formData.provinsi]);

  // Handle sumber leads change - reset ads fields if not ads source
  useEffect(() => {
    if (!isAdsSource(formData.sumberLeads)) {
      setFormData(prev => ({
        ...prev,
        kodeAds: "",
        idAds: ""
      }));
    }
  }, [formData.sumberLeads]);

  // Handle status leads change - reset bukan leads fields if not "Bukan Leads"
  useEffect(() => {
    if (formData.statusLeads !== "Bukan Leads") {
      setFormData(prev => ({
        ...prev,
        bukanLeads: "",
        keteranganBukanLeads: ""
      }));
    }
  }, [formData.statusLeads]);

  // Auto-fill PIC Leads with logged-in user name
  useEffect(() => {
    if (appUser) {
      setFormData(prev => ({
        ...prev,
        picLeads: getUserName()
      }));
    }
  }, [appUser]);

  // Validation function
  const validateForm = () => {
    const errors = [];
    const fieldLabels = {
      tanggalProspek: "Tanggal Prospek Chat",
      tanggalJadiLeads: "Tanggal Prospek jadi Leads",
      sumberLeads: "Sumber Leads",
      kodeAds: "Kode Ads",
      idAds: "ID Ads",
      namaProspek: "Nama Prospek",
      noWhatsApp: "No WhatsApp",
      email: "E-mail",
      statusLeads: "Status Leads",
      bukanLeads: "Bukan Leads",
      keteranganBukanLeads: "Keterangan Bukan Leads",
      layananAssist: "Layanan Assist",
      namaFaskes: "Nama Faskes",
      tipeFaskes: "Tipe Faskes",
      provinsi: "Provinsi",
      kota: "Kota/Kabupaten",
      picLeads: "PIC Leads"
    };

    // Basic required fields (email, layananAssist, namaFaskes, tipeFaskes, provinsi, kota sekarang optional)
    const basicRequiredFields = [
      'tanggalProspek', 'sumberLeads', 'namaProspek', 'noWhatsApp',
      'statusLeads', 'picLeads'
    ];

    // Check basic required fields
    basicRequiredFields.forEach(field => {
      if (!formData[field] || formData[field].trim() === '') {
        errors.push(fieldLabels[field]);
      }
    });

    // Email validation
    if (formData.email && formData.email.trim() !== '') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        errors.push("Format E-mail tidak valid");
      }
    }

    // Conditional validation for ads fields
    if (isAdsSource(formData.sumberLeads)) {
      if (!formData.kodeAds || formData.kodeAds.trim() === '') {
        errors.push(fieldLabels.kodeAds);
      }
      if (formData.kodeAds && (!formData.idAds || formData.idAds.trim() === '')) {
        errors.push(fieldLabels.idAds);
      }
    }

    // Conditional validation for "Bukan Leads"
    if (formData.statusLeads === "Bukan Leads") {
      if (!formData.bukanLeads || formData.bukanLeads.trim() === '') {
        errors.push(fieldLabels.bukanLeads);
      }
    }

    // Conditional validation for "Leads" status
    if (formData.statusLeads === "Leads") {
      if (!formData.tanggalJadiLeads || formData.tanggalJadiLeads.trim() === '') {
        errors.push(fieldLabels.tanggalJadiLeads);
      }
    }

    return errors;
  };

  // Function to handle form data change and hide validation alert
  const handleFormDataChange = (key, value) => {
    setFormData(prev => ({
      ...prev,
      [key]: value
    }));

    // Hide validation alert when user starts typing
    if (showValidationAlert) {
      setShowValidationAlert(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const errors = validateForm();
    
    if (errors.length > 0) {
      setValidationErrors(errors);
      setShowValidationAlert(true);
      
      // Scroll to top to show alert
      window.scrollTo({ top: 0, behavior: 'smooth' });
      
      return;
    }
    
    // Hide validation alert if previously shown
    setShowValidationAlert(false);
    setValidationErrors([]);
    
    try {
      // Convert layananAssist array to comma-separated string for backend
      const dataToSubmit = {
        ...formData,
        layananAssist: Array.isArray(formData.layananAssist) 
          ? formData.layananAssist.join(', ') 
          : formData.layananAssist,
        // Set tanggalJadiLeads if status is "Leads", otherwise keep existing value (don't reset to null)
        tanggalJadiLeads: formData.statusLeads === "Leads" ? formData.tanggalJadiLeads : formData.tanggalJadiLeads
      };
      
      // Submit to database
      await createProspekMutation.mutateAsync(dataToSubmit);
      
      // Set success message in localStorage
      localStorage.setItem('prospectSuccess', 'Data prospek berhasil ditambahkan.');
      
      // Navigate back to data prospek page
      router.push('/data-prospek');
    } catch (error) {
      console.error('Error creating prospek:', error);
      alert('Gagal menambahkan prospek. Silakan coba lagi.');
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Form Tambah Prospek</h1>
        <p className="text-gray-600 mt-1">Lengkapi informasi prospek baru dengan detail yang akurat</p>
      </div>

      {/* Validation Alert */}
      {showValidationAlert && validationErrors.length > 0 && (
        <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-md">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Form belum lengkap
              </h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Field berikut wajib diisi: <span className="font-semibold">{validationErrors.join(', ')}</span></p>
              </div>
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => setShowValidationAlert(false)}
                  className="text-sm text-red-800 hover:text-red-900 font-medium underline focus:outline-none"
                >
                  Tutup peringatan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="bg-white shadow rounded-lg p-6">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi Dasar</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Prospek Chat *
                </label>
                <input
                  type="date"
                  value={formData.tanggalProspek}
                  onChange={(e) => handleFormDataChange('tanggalProspek', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              {/* Tanggal Jadi Leads - Only visible when status is "Leads" */}
              {formData.statusLeads === "Leads" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tanggal Prospek jadi Leads *
                  </label>
                  <input
                    type="date"
                    value={formData.tanggalJadiLeads}
                    onChange={(e) => handleFormDataChange('tanggalJadiLeads', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={formData.statusLeads === "Leads"}
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sumber Leads *
                </label>
                <select
                  value={formData.sumberLeads}
                  onChange={(e) => handleFormDataChange('sumberLeads', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pilih sumber leads</option>
                  {sumberLeadsData.map((sumber) => (
                    <option key={sumber} value={sumber}>{sumber}</option>
                  ))}
                </select>
              </div>

              {/* Kode Ads - Only visible if sumber leads contains "Ads" */}
              {isAdsSource(formData.sumberLeads) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Kode Ads *
                  </label>
                  <select
                    value={formData.kodeAds}
                    onChange={(e) => handleFormDataChange('kodeAds', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={isAdsSource(formData.sumberLeads)}
                  >
                    <option value="">Pilih kode ads</option>
                    {kodeAdsData.map((kode) => (
                      <option key={kode} value={kode}>{kode}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* ID Ads - Only visible and active after Kode Ads is selected */}
            {isAdsSource(formData.sumberLeads) && formData.kodeAds && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    ID Ads *
                  </label>
                  <select
                    value={formData.idAds}
                    onChange={(e) => handleFormDataChange('idAds', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required={formData.kodeAds !== ""}
                  >
                    <option value="">Pilih ID ads</option>
                    {Array.from({length: 30}, (_, i) => i + 1).map((num) => (
                      <option key={num} value={num}>{num}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Contact Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi Kontak</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Prospek *
                </label>
                <input
                  type="text"
                  value={formData.namaProspek}
                  onChange={(e) => handleFormDataChange('namaProspek', e.target.value)}
                  placeholder="Masukkan nama lengkap prospek"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No WhatsApp *
                </label>
                <input
                  type="text"
                  value={formData.noWhatsApp}
                  onChange={(e) => handleFormDataChange('noWhatsApp', e.target.value)}
                  placeholder="Contoh: +628123456789"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFormDataChange('email', e.target.value)}
                  placeholder="Contoh: user@example.com"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

            </div>
          </div>

          {/* Status Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Status & Kategori</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status Leads *
                </label>
                <select
                  value={formData.statusLeads}
                  onChange={(e) => handleFormDataChange('statusLeads', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                >
                  <option value="">Pilih status leads</option>
                  {statusLeadsData.map((status) => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>

              {/* Bukan Leads fields - Only active if Status Leads = "Bukan Leads" */}
              {formData.statusLeads === "Bukan Leads" && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Bukan Leads *
                    </label>
                    <select
                      value={formData.bukanLeads}
                      onChange={(e) => handleFormDataChange('bukanLeads', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required={formData.statusLeads === "Bukan Leads"}
                    >
                      <option value="">Pilih alasan bukan leads</option>
                      {bukanLeadsData.map((alasan) => (
                        <option key={alasan} value={alasan}>{alasan}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Keterangan Bukan Leads
                    </label>
                    <textarea
                      value={formData.keteranganBukanLeads}
                      onChange={(e) => handleFormDataChange('keteranganBukanLeads', e.target.value)}
                      placeholder="Masukkan keterangan tambahan mengenai alasan bukan leads"
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      rows={3}
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Layanan Assist
                </label>
                <MultiSelectDropdown
                  options={layananAssistData}
                  value={formData.layananAssist}
                  onChange={(selected) => handleFormDataChange('layananAssist', selected)}
                  placeholder="Pilih layanan assist"
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Facility Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi Fasilitas Kesehatan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Faskes
                </label>
                <input
                  type="text"
                  value={formData.namaFaskes}
                  onChange={(e) => handleFormDataChange('namaFaskes', e.target.value)}
                  placeholder="Masukkan nama fasilitas kesehatan"
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipe Faskes
                </label>
                <select
                  value={formData.tipeFaskes}
                  onChange={(e) => handleFormDataChange('tipeFaskes', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih tipe faskes</option>
                  {tipeFaskesData.map((tipe) => (
                    <option key={tipe} value={tipe}>{tipe}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Location Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Lokasi Fasilitas Kesehatan</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provinsi
                </label>
                <select
                  value={formData.provinsi}
                  onChange={(e) => handleFormDataChange('provinsi', e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Pilih provinsi</option>
                  {provinsiData.map((provinsi) => (
                    <option key={provinsi.id} value={provinsi.name}>{provinsi.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kota/Kabupaten
                </label>
                <div className="relative">
                  <select
                    value={formData.kota}
                    onChange={(e) => handleFormDataChange('kota', e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    disabled={!formData.provinsi || loadingKota || kotaError !== ""}
                  >
                    <option value="">
                      {!formData.provinsi ? "Pilih provinsi terlebih dahulu" : 
                       loadingKota ? "Memuat data kota/kabupaten..." : 
                       kotaError ? kotaError :
                       kotaList.length === 0 ? "Data kota tidak tersedia" :
                       "Pilih kota/kabupaten"}
                    </option>
                    {kotaList.map((kota) => (
                      <option key={kota} value={kota}>{kota}</option>
                    ))}
                  </select>
                  {loadingKota && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                {kotaError && (
                  <p className="text-xs text-red-600 mt-1 flex items-center">
                    <span className="mr-1">⚠️</span>
                    {kotaError}
                  </p>
                )}
                {!kotaError && kotaList.length > 0 && (
                  <p className="text-xs text-green-600 mt-1 flex items-center">
                    <span className="mr-1">✅</span>
                    {kotaList.length} kota/kabupaten tersedia
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* PIC Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Informasi PIC</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  PIC Leads *
                </label>
                <input
                  type="text"
                  value={formData.picLeads}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600 cursor-not-allowed"
                  disabled
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Field ini otomatis terisi dengan nama user yang sedang login</p>
              </div>
            </div>
          </div>

          {/* Additional Information Section */}
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4 border-b pb-2">Keterangan Tambahan</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Keterangan
              </label>
              <textarea
                value={formData.keterangan}
                onChange={(e) => handleFormDataChange('keterangan', e.target.value)}
                placeholder="Masukkan keterangan atau catatan tambahan mengenai data prospek ini..."
                className="w-full border border-gray-300 rounded-md px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical min-h-[100px] transition-colors duration-200"
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-1">
                Field ini opsional. Gunakan untuk menambahkan catatan, observasi, atau informasi penting lainnya tentang prospek.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <button
              type="button"
              onClick={() => router.push('/data-prospek')}
              className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors duration-200"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-md hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-md"
            >
              Simpan Data Prospek
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
