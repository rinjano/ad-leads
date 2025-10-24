"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PlusCircle, Pencil, Trash2, Search, Database, Users, Target, Code, Building, Flag, UserX, Eye, Edit3, CheckCircle, AlertCircle, X, Package } from "lucide-react";
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LayananTab } from '@/components/LayananTab';
import { KodeAdsTab } from '@/components/KodeAdsTab';
import { SumberLeadsTab } from '@/components/SumberLeadsTab';
import { TipeFaskesTab } from '@/components/TipeFaskesTab';
import { BukanLeadsTab } from '@/components/BukanLeadsTab';
import { StatusLeadsTab } from '@/components/StatusLeadsTab';
import { UserTab } from '@/components/UserTab';
import { ProdukTab } from '@/components/ProdukTab';

const initialLeadSources = [
	{ id: 1, name: "Instagram", createdAt: "2025-09-01", updatedAt: "2025-09-10" },
	{ id: 2, name: "Facebook", createdAt: "2025-09-05", updatedAt: "2025-09-20" },
	{ id: 3, name: "WhatsApp", createdAt: "2025-09-03", updatedAt: "2025-09-15" },
	{ id: 4, name: "Website", createdAt: "2025-09-02", updatedAt: "2025-09-12" }
];

const initialFaskesTypes = [
	{ id: 1, name: "Rumah Sakit", createdAt: "2025-09-01", updatedAt: "2025-09-10" },
	{ id: 2, name: "Klinik", createdAt: "2025-09-05", updatedAt: "2025-09-20" },
	{ id: 3, name: "Puskesmas", createdAt: "2025-09-04", updatedAt: "2025-09-18" }
];

const initialLeadStatus = [
	{ id: 1, name: "Baru", createdAt: "2025-09-01", updatedAt: "2025-09-10" },
	{ id: 2, name: "Follow Up", createdAt: "2025-09-05", updatedAt: "2025-09-20" },
	{ id: 3, name: "Qualified", createdAt: "2025-09-06", updatedAt: "2025-09-21" },
	{ id: 4, name: "Proposal", createdAt: "2025-09-07", updatedAt: "2025-09-22" }
];

const initialNotLeads = [
	{ id: 1, name: "Spam", createdAt: "2025-09-01", updatedAt: "2025-09-10" },
	{ id: 2, name: "Tidak Tertarik", createdAt: "2025-09-05", updatedAt: "2025-09-20" },
	{ id: 3, name: "Salah Target", createdAt: "2025-09-04", updatedAt: "2025-09-19" }
];

const initialUsers = [
	{ id: 1, name: "John Doe", email: "john@example.com", role: "Admin", createdAt: "2025-09-26" },
	{ id: 2, name: "Jane Smith", email: "jane@example.com", role: "CS Support", createdAt: "2025-09-25" },
	{ id: 3, name: "Mike Johnson", email: "mike@example.com", role: "Advertiser", createdAt: "2025-09-24" }
];

const initialServices = [
	{ id: 1, name: "Konsultasi Medis", createdAt: "2025-09-01", updatedAt: "2025-09-10" },
	{ id: 2, name: "Medical Check-up", createdAt: "2025-09-05", updatedAt: "2025-09-20" },
	{ id: 3, name: "Vaksinasi", createdAt: "2025-09-03", updatedAt: "2025-09-15" }
];

const initialProducts = [
	{ id: 1, name: "Paket Konsultasi Dokter Umum", serviceId: 1, serviceName: "Konsultasi Medis", description: "Konsultasi dengan dokter umum berpengalaman", createdAt: "2025-09-01", updatedAt: "2025-09-10" },
	{ id: 2, name: "Paket Konsultasi Spesialis", serviceId: 1, serviceName: "Konsultasi Medis", description: "Konsultasi dengan dokter spesialis", createdAt: "2025-09-02", updatedAt: "2025-09-11" },
	{ id: 3, name: "Medical Check-up Lengkap", serviceId: 2, serviceName: "Medical Check-up", description: "Pemeriksaan kesehatan menyeluruh", createdAt: "2025-09-05", updatedAt: "2025-09-20" },
	{ id: 4, name: "Medical Check-up Basic", serviceId: 2, serviceName: "Medical Check-up", description: "Pemeriksaan kesehatan dasar", createdAt: "2025-09-06", updatedAt: "2025-09-21" },
	{ id: 5, name: "Vaksin COVID-19", serviceId: 3, serviceName: "Vaksinasi", description: "Vaksinasi COVID-19 dengan vaksin terbaru", createdAt: "2025-09-03", updatedAt: "2025-09-15" }
];

const initialAdsCodes = [
	{ id: 1, code: "IGM-2024-001", createdAt: "2025-09-01", updatedAt: "2025-09-10" },
	{ id: 2, code: "FBM-2024-002", createdAt: "2025-09-05", updatedAt: "2025-09-20" },
	{ id: 3, name: "Google Ads Campaign", code: "GAD-2024-003", createdAt: "2025-09-03", updatedAt: "2025-09-15" }
];

// Simulasi data relasi untuk mengecek apakah data master sudah digunakan
const dataRelations = {
	services: [
		// Layanan dengan ID 1 dan 2 sudah digunakan di produk
		{ serviceId: 1, usedInProducts: true, usedInTransactions: true },
		{ serviceId: 2, usedInProducts: true, usedInTransactions: false },
		{ serviceId: 3, usedInProducts: true, usedInTransactions: false }
	],
	products: [
		// Produk dengan ID 1, 2 sudah digunakan di transaksi/prospek
		{ productId: 1, usedInTransactions: true, usedInProspects: true },
		{ productId: 2, usedInTransactions: false, usedInProspects: true },
		{ productId: 3, usedInTransactions: false, usedInProspects: false },
		{ productId: 4, usedInTransactions: false, usedInProspects: false },
		{ productId: 5, usedInTransactions: true, usedInProspects: false }
	],
	users: [
		// User dengan ID 1 sudah punya transaksi
		{ userId: 1, hasTransactions: true, hasLeads: true },
		{ userId: 2, hasTransactions: false, hasLeads: true },
		{ userId: 3, hasTransactions: false, hasLeads: false }
	],
	adsCodes: [
		// Kode Ads yang sudah digunakan di campaign/leads
		{ adsCodeId: 1, usedInCampaigns: true, usedInLeads: true },
		{ adsCodeId: 2, usedInCampaigns: false, usedInLeads: true },
		{ adsCodeId: 3, usedInCampaigns: false, usedInLeads: false }
	],
	leadSources: [
		// Sumber Leads yang sudah digunakan di prospects/leads  
		{ leadSourceId: 1, usedInLeads: true, usedInProspects: true },
		{ leadSourceId: 2, usedInLeads: true, usedInProspects: false },
		{ leadSourceId: 3, usedInLeads: false, usedInProspects: false }
	],
	facilityTypes: [
		// Tipe Faskes yang sudah digunakan di prospects/leads
		{ facilityTypeId: 1, usedInLeads: true, usedInProspects: true },
		{ facilityTypeId: 2, usedInLeads: false, usedInProspects: true },
		{ facilityTypeId: 3, usedInLeads: false, usedInProspects: false }
	],
	leadStatuses: [
		// Status Leads yang sudah digunakan di leads
		{ leadStatusId: 1, usedInLeads: true, usedInProspects: true },
		{ leadStatusId: 2, usedInLeads: true, usedInProspects: false },
		{ leadStatusId: 3, usedInLeads: false, usedInProspects: false }
	],
	notLeads: [
		// Bukan Leads yang sudah digunakan di prospects/leads/transaksi
		{ notLeadId: 1, usedInLeads: true, usedInProspects: true, usedInTransactions: true },
		{ notLeadId: 2, usedInLeads: false, usedInProspects: true, usedInTransactions: false },
		{ notLeadId: 3, usedInLeads: false, usedInProspects: false, usedInTransactions: false }
	]
};

// Fungsi untuk mengecek apakah data master sudah digunakan
const checkDataUsage = (type, id) => {
	switch (type) {
		case 'service':
			const serviceRelation = dataRelations.services.find(rel => rel.serviceId === id);
			return serviceRelation ? (serviceRelation.usedInProducts || serviceRelation.usedInTransactions) : false;
		case 'product':
			const productRelation = dataRelations.products.find(rel => rel.productId === id);
			return productRelation ? (productRelation.usedInTransactions || productRelation.usedInProspects) : false;
		case 'user':
			const userRelation = dataRelations.users.find(rel => rel.userId === id);
			return userRelation ? (userRelation.hasTransactions || userRelation.hasLeads) : false;
		case 'adsCode':
			const adsCodeRelation = dataRelations.adsCodes.find(rel => rel.adsCodeId === id);
			return adsCodeRelation ? (adsCodeRelation.usedInCampaigns || adsCodeRelation.usedInLeads) : false;
		case 'leadSource':
			const leadSourceRelation = dataRelations.leadSources.find(rel => rel.leadSourceId === id);
			return leadSourceRelation ? (leadSourceRelation.usedInLeads || leadSourceRelation.usedInProspects) : false;
		case 'facilityType':
			const facilityTypeRelation = dataRelations.facilityTypes.find(rel => rel.facilityTypeId === id);
			return facilityTypeRelation ? (facilityTypeRelation.usedInLeads || facilityTypeRelation.usedInProspects) : false;
		case 'leadStatus':
			const leadStatusRelation = dataRelations.leadStatuses.find(rel => rel.leadStatusId === id);
			return leadStatusRelation ? (leadStatusRelation.usedInLeads || leadStatusRelation.usedInProspects) : false;
		case 'notLead':
			const notLeadRelation = dataRelations.notLeads.find(rel => rel.notLeadId === id);
			return notLeadRelation ? (notLeadRelation.usedInLeads || notLeadRelation.usedInProspects || notLeadRelation.usedInTransactions) : false;
		default:
			return false;
	}
};


function ServiceTab({ services }) {
	const [showModal, setShowModal] = useState(false);
	const [layanan, setLayanan] = useState("");
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");

	// Edit modal states
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingService, setEditingService] = useState(null);
	const [editLayanan, setEditLayanan] = useState("");
	const [editError, setEditError] = useState("");

	// Delete confirmation modal states
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [serviceToDelete, setServiceToDelete] = useState(null);

	// Services data state (to allow for deletion)
	const [servicesList, setServicesList] = useState(services);

	// Notification state
	const [notification, setNotification] = useState(null);

	const filteredServices = servicesList.filter(service =>
		service.name.toLowerCase().includes(searchTerm.toLowerCase())
	);

	function openModal() {
		setShowModal(true);
	}

	function closeModal() {
		setShowModal(false);
		setLayanan("");
		setError("");
	}

	function handleSubmit(e) {
		e.preventDefault();
		if (!layanan) {
			setError("Nama Layanan wajib diisi.");
			return;
		}
		
		// Add new service to the list
		const newService = {
			id: servicesList.length + 1,
			name: layanan,
			createdAt: new Date().toISOString().split('T')[0],
			updatedAt: new Date().toISOString().split('T')[0]
		};
		setServicesList([...servicesList, newService]);
		
		// Show notification
		showNotification("Data Layanan berhasil ditambahkan.", "success");
		
		closeModal();
	}

	// Notification function
	const showNotification = (message, type = "success") => {
		setNotification({ message, type });
		
		// Auto-hide after 3 seconds
		setTimeout(() => {
			setNotification(null);
		}, 3000);
	};

	// Delete confirmation modal functions
	const openDeleteModal = (service) => {
		setServiceToDelete(service);
		setShowDeleteModal(true);
	};

	const closeDeleteModal = () => {
		setShowDeleteModal(false);
		setServiceToDelete(null);
	};

	const handleDeleteService = () => {
		if (serviceToDelete) {
			// Backend validation: Check if service is still being used
			const isUsed = checkDataUsage('service', serviceToDelete.id);
			if (isUsed) {
				showNotification("Data layanan tidak dapat dihapus karena masih digunakan di data lain.", "error");
				closeDeleteModal();
				return;
			}
			
			// Remove the service from the list
			setServicesList(prevServices => 
				prevServices.filter(service => service.id !== serviceToDelete.id)
			);
			
			// Close the modal
			closeDeleteModal();
			
			// Show delete notification
			showNotification("Data Layanan berhasil dihapus.", "success");
		}
	};

	// Edit modal functions
	const openEditModal = (service) => {
		setEditingService(service);
		setEditLayanan(service.name);
		setEditError("");
		setShowEditModal(true);
	};

	const closeEditModal = () => {
		setShowEditModal(false);
		setEditingService(null);
		setEditLayanan("");
		setEditError("");
	};

	const handleEditSubmit = (e) => {
		e.preventDefault();
		if (!editLayanan) {
			setEditError("Nama Layanan wajib diisi.");
			return;
		}
		
		// Backend validation: Check if service is still being used
		const isUsed = checkDataUsage('service', editingService.id);
		if (isUsed) {
			setEditError("Data layanan tidak dapat diubah karena masih digunakan di data lain.");
			return;
		}
		
		// Update service in the list
		setServicesList(prevServices => 
			prevServices.map(service => 
				service.id === editingService.id 
					? { ...service, name: editLayanan, updatedAt: new Date().toISOString().split('T')[0] }
					: service
			)
		);
		
		// Show notification
		showNotification("Data Layanan berhasil diperbarui.", "success");
		
		// Close modal
		closeEditModal();
	};

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="relative max-w-sm">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
					<Input
						type="text"
						placeholder="Cari layanan..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 bg-slate-50 border-slate-200 h-10 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
					/>
				</div>
				<Button 
					className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white" 
					onClick={openModal}
				>
					<PlusCircle className="h-4 w-4 mr-2" />
					Tambah Layanan
				</Button>
			</div>

			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50" onClick={closeModal}>
					<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
						<h3 className="text-xl font-bold mb-6 text-gray-800">Tambah Layanan Baru</h3>
						<form className="space-y-4" onSubmit={handleSubmit} noValidate>
							<div>
								<label className="block text-sm font-medium mb-1 text-gray-700">Layanan <span className="text-red-500">*</span></label>
								<Input 
									type="text" 
									placeholder="Masukkan nama layanan" 
									value={layanan} 
									onChange={e => setLayanan(e.target.value)} 
									className="border-gray-300 focus:border-blue-500"
								/>
								{error && <p className="text-xs text-red-500 mt-1">{error}</p>}
							</div>
							<div className="flex justify-end gap-3 pt-4">
								<Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
								<Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">Simpan</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Service Modal */}
			{showEditModal && editingService && (
				<div 
					className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							closeEditModal();
						}
					}}
				>
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-auto">
						<div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b border-slate-200 p-6">
							<h3 className="text-xl font-bold text-slate-900 mb-1">Edit Layanan</h3>
							<p className="text-sm text-slate-600">Perbarui informasi layanan</p>
						</div>
						<form onSubmit={handleEditSubmit} className="p-6">
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Nama Layanan <span className="text-red-500">*</span>
									</label>
									<Input 
										name="layanan"
										placeholder="Masukkan nama layanan" 
										value={editLayanan} 
										onChange={e => setEditLayanan(e.target.value)} 
										className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
									/>
									{editError && (
										<p className="text-red-600 text-sm mt-1">{editError}</p>
									)}
								</div>
							</div>
							<div className="flex justify-end gap-3 pt-4">
								<Button type="button" variant="outline" onClick={closeEditModal}>Batal</Button>
								<Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">Simpan</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Table Container - Modern style matching User tab */}
			<div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
				{/* Table Header */}
				<div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-blue-100 rounded-lg">
								<Target className="h-5 w-5 text-blue-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-slate-900">Data Layanan</h3>
								<p className="text-sm text-slate-600">Kelola layanan yang tersedia</p>
							</div>
						</div>
						<div className="text-sm text-slate-500">
							Total: <span className="font-medium text-slate-900">{filteredServices.length}</span> layanan
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
										<Target className="h-4 w-4 text-slate-500" />
										<span>Nama Layanan</span>
									</div>
								</TableHead>
								<TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
									<div className="flex items-center gap-2">
										<span>Tanggal Dibuat</span>
									</div>
								</TableHead>
								<TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
									<div className="flex items-center gap-2">
										<span>Terakhir Update</span>
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
							{filteredServices.length > 0 ? (
								filteredServices.map((service, index) => (
									<TableRow key={service.id} className="transition-all duration-200 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
										<TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
													{service.name.charAt(0).toUpperCase()}
												</div>
												<div>
													<div className="font-semibold text-slate-900">{service.name}</div>
													<div className="text-sm text-slate-500">ID: {service.id}</div>
												</div>
											</div>
										</TableCell>
										<TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
											<div className="text-slate-700">
												{new Date(service.createdAt).toLocaleDateString("id-ID", { 
													day: "numeric", 
													month: "long", 
													year: "numeric" 
												})}
											</div>
										</TableCell>
										<TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
											<div className="text-slate-700">
												{new Date(service.updatedAt).toLocaleDateString("id-ID", { 
													day: "numeric", 
													month: "long", 
													year: "numeric" 
												})}
											</div>
										</TableCell>
										<TableCell className="py-4 px-6">
											<div className="flex items-center justify-center gap-2">
												{(() => {
													const isUsed = checkDataUsage('service', service.id);
													return (
														<>
															<Button 
																variant="ghost" 
																size="sm" 
																onClick={isUsed ? undefined : () => openEditModal(service)}
																disabled={isUsed}
																className={`h-8 w-8 p-0 rounded-lg ${
																	isUsed 
																		? 'cursor-not-allowed opacity-50 bg-gray-100 text-gray-400' 
																		: 'hover:bg-yellow-50 hover:text-yellow-600'
																}`}
																title={isUsed ? "Data sudah digunakan di data lain, tidak bisa diubah" : "Edit Layanan"}
															>
																<Edit3 className="h-4 w-4" />
															</Button>
															<Button 
																variant="ghost" 
																size="sm" 
																onClick={isUsed ? undefined : () => openDeleteModal(service)}
																disabled={isUsed}
																className={`h-8 w-8 p-0 rounded-lg ${
																	isUsed 
																		? 'cursor-not-allowed opacity-50 bg-gray-100 text-gray-400' 
																		: 'text-red-500 hover:bg-red-50 hover:text-red-700'
																}`}
																title={isUsed ? "Data sudah digunakan di data lain, tidak bisa dihapus" : "Hapus Layanan"}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</>
													);
												})()}
											</div>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={4} className="py-12 text-center">
										<div className="flex flex-col items-center justify-center text-slate-500">
											<div className="p-4 bg-slate-100 rounded-full mb-4">
												<Target className="h-8 w-8 text-slate-400" />
											</div>
											<p className="text-lg font-medium text-slate-600 mb-1">Tidak ada layanan ditemukan</p>
											<p className="text-sm text-slate-500">Coba ubah kata kunci pencarian atau tambah layanan baru</p>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>

				{/* Table Footer */}
				<div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
					<div className="flex items-center justify-between text-sm text-slate-600">
						<div className="flex items-center gap-2">
							<Target className="h-4 w-4" />
							<span>
								Menampilkan {filteredServices.length > 0 ? '1' : '0'} hingga {filteredServices.length} dari {filteredServices.length} layanan
							</span>
						</div>
						{filteredServices.length > 0 && (
							<div className="text-slate-500">
								Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			{showDeleteModal && serviceToDelete && (
				<div 
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
					onClick={(e) => {
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
									Apakah Anda yakin ingin menghapus layanan ini?
								</p>
								<div className="bg-white border border-red-200 rounded-lg p-3">
									<p className="font-semibold text-slate-900">{serviceToDelete.name}</p>
									<p className="text-sm text-slate-600">ID: {serviceToDelete.id}</p>
									<p className="text-sm text-slate-600">
										Dibuat: {new Date(serviceToDelete.createdAt).toLocaleDateString("id-ID", { 
											day: "numeric", 
											month: "long", 
											year: "numeric" 
										})}
									</p>
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
									onClick={handleDeleteService}
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

			{/* Notification Toast */}
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

			<style jsx>{`
				@keyframes progressBar {
					from { width: 100%; }
					to { width: 0%; }
				}
				
				@keyframes slide-in-from-top-4 {
					from { 
						transform: translateY(-1rem);
						opacity: 0;
					}
					to { 
						transform: translateY(0);
						opacity: 1;
					}
				}
				
				@keyframes zoom-in {
					from { 
						transform: scale(0.95);
					}
					to { 
						transform: scale(1);
					}
				}
				
				@keyframes fade-in {
					from { opacity: 0; }
					to { opacity: 1; }
				}
				
				.animate-in {
					animation: slide-in-from-top-4 0.3s ease-out, zoom-in 0.3s ease-out, fade-in 0.3s ease-out;
				}
			`}</style>
		</div>
	);
}

function AdsCodeTab({ adsCodes }) {
	const [showModal, setShowModal] = useState(false);
	const [kodeAds, setKodeAds] = useState("");
	const [namaKampanye, setNamaKampanye] = useState("");
	const [error, setError] = useState("");
	const [searchTerm, setSearchTerm] = useState("");
	
	// Edit modal states
	const [showEditModal, setShowEditModal] = useState(false);
	const [editingAdsCode, setEditingAdsCode] = useState(null);
	const [editKodeAds, setEditKodeAds] = useState("");
	const [editNamaKampanye, setEditNamaKampanye] = useState("");
	const [editError, setEditError] = useState("");
	
	// State untuk delete modal dan notifications
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [adsCodeToDelete, setAdsCodeToDelete] = useState(null);
	const [notification, setNotification] = useState(null);
	const [adsCodes2, setAdsCodes2] = useState(adsCodes);

	const filteredAdsCodes = adsCodes2.filter(ads =>
		ads.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
		(ads.name && ads.name.toLowerCase().includes(searchTerm.toLowerCase()))
	);

	function openModal() {
		setShowModal(true);
	}

	function closeModal() {
		setShowModal(false);
		setKodeAds("");
		setNamaKampanye("");
		setError("");
	}

	// Show notification function
	const showNotification = (type, message) => {
		setNotification({ type, message });
		setTimeout(() => {
			setNotification(null);
		}, 3000);
	};

	// Open delete modal
	const openDeleteModal = (adsCode) => {
		setAdsCodeToDelete(adsCode);
		setShowDeleteModal(true);
	};

	// Close delete modal
	const closeDeleteModal = () => {
		setShowDeleteModal(false);
		setAdsCodeToDelete(null);
	};

	// Handle delete ads code
	const handleDeleteAdsCode = () => {
		if (adsCodeToDelete) {
			// Backend validation: Check if ads code is still being used
			const isUsed = checkDataUsage('adsCode', adsCodeToDelete.id);
			if (isUsed) {
				showNotification('error', "Data kode ads tidak dapat dihapus karena masih digunakan di data lain.");
				closeDeleteModal();
				return;
			}
			
			setAdsCodes2(prev => prev.filter(ads => ads.id !== adsCodeToDelete.id));
			showNotification('success', `Kode ads "${adsCodeToDelete.code}" berhasil dihapus!`);
			closeDeleteModal();
		}
	};

	// Edit modal functions
	const openEditModal = (adsCode) => {
		setEditingAdsCode(adsCode);
		setEditKodeAds(adsCode.code);
		setEditNamaKampanye(adsCode.name || "");
		setEditError("");
		setShowEditModal(true);
	};

	const closeEditModal = () => {
		setShowEditModal(false);
		setEditingAdsCode(null);
		setEditKodeAds("");
		setEditNamaKampanye("");
		setEditError("");
	};

	const handleEditSubmit = (e) => {
		e.preventDefault();
		if (!editKodeAds) {
			setEditError("Kode Ads wajib diisi.");
			return;
		}
		
		// Backend validation: Check if ads code is still being used
		const isUsed = checkDataUsage('adsCode', editingAdsCode.id);
		if (isUsed) {
			setEditError("Data kode ads tidak dapat diubah karena masih digunakan di data lain.");
			return;
		}
		
		// Update ads code in the list
		setAdsCodes2(prev => 
			prev.map(ads => 
				ads.id === editingAdsCode.id 
					? { ...ads, code: editKodeAds, name: editNamaKampanye || null, updatedAt: new Date() }
					: ads
			)
		);
		
		// Show notification
		showNotification('success', `Kode ads "${editKodeAds}" berhasil diperbarui!`);
		
		// Close modal
		closeEditModal();
	};

	function handleSubmit(e) {
		e.preventDefault();
		if (!kodeAds) {
			setError("Kode Ads wajib diisi.");
			return;
		}
		// Submit logic here
		const newAdsCode = {
			id: Date.now(),
			code: kodeAds,
			name: namaKampanye || null,
			createdAt: new Date(),
			updatedAt: new Date()
		};
		setAdsCodes2(prev => [...prev, newAdsCode]);
		showNotification('success', `Kode ads "${kodeAds}" berhasil ditambahkan!`);
		closeModal();
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="relative max-w-sm">
					<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
					<Input
						type="text"
						placeholder="Cari kode ads atau kampanye..."
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						className="pl-10 bg-slate-50 border-slate-200 h-10 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
					/>
				</div>
				<Button 
					className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white" 
					onClick={openModal}
				>
					<PlusCircle className="h-4 w-4 mr-2" />
					Tambah Kode Ads
				</Button>
			</div>

			{showModal && (
				<div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50" onClick={closeModal}>
					<div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
						<h3 className="text-xl font-bold mb-6 text-gray-800">Tambah Kode Ads Baru</h3>
						<form className="space-y-4" onSubmit={handleSubmit} noValidate>
							<div>
								<label className="block text-sm font-medium mb-1 text-gray-700">Kode Ads <span className="text-red-500">*</span></label>
								<Input 
									type="text" 
									placeholder="Contoh: IGM-2024-001" 
									value={kodeAds} 
									onChange={e => setKodeAds(e.target.value)} 
									className="border-gray-300 focus:border-blue-500"
								/>
								{error && <p className="text-xs text-red-500 mt-1">{error}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium mb-1 text-gray-700">Nama Kampanye</label>
								<Input 
									type="text" 
									placeholder="Nama kampanye (opsional)" 
									value={namaKampanye} 
									onChange={e => setNamaKampanye(e.target.value)} 
									className="border-gray-300 focus:border-blue-500"
								/>
							</div>
							<div className="flex justify-end gap-3 pt-4">
								<Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
								<Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">Simpan</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Edit Ads Code Modal */}
			{showEditModal && editingAdsCode && (
				<div 
					className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							closeEditModal();
						}
					}}
				>
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-auto">
						<div className="bg-gradient-to-r from-orange-50 to-amber-50 border-b border-slate-200 p-6">
							<h3 className="text-xl font-bold text-slate-900 mb-1">Edit Kode Ads</h3>
							<p className="text-sm text-slate-600">Perbarui informasi kode ads</p>
						</div>
						<form onSubmit={handleEditSubmit} className="p-6">
							<div className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Kode Ads <span className="text-red-500">*</span>
									</label>
									<Input 
										name="kodeAds"
										placeholder="Contoh: IGM-2024-001" 
										value={editKodeAds} 
										onChange={e => setEditKodeAds(e.target.value)} 
										className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
									/>
									{editError && (
										<p className="text-red-600 text-sm mt-1">{editError}</p>
									)}
								</div>
								<div>
									<label className="block text-sm font-medium text-slate-700 mb-2">
										Nama Kampanye
									</label>
									<Input 
										name="namaKampanye"
										placeholder="Nama kampanye (opsional)" 
										value={editNamaKampanye} 
										onChange={e => setEditNamaKampanye(e.target.value)} 
										className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
									/>
								</div>
							</div>
							<div className="flex justify-end gap-3 pt-4">
								<Button type="button" variant="outline" onClick={closeEditModal}>Batal</Button>
								<Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">Simpan</Button>
							</div>
						</form>
					</div>
				</div>
			)}

			{/* Table Container - Modern style matching other tabs */}
			<div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
				{/* Table Header */}
				<div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-3">
							<div className="p-2 bg-purple-100 rounded-lg">
								<Code className="h-5 w-5 text-purple-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-slate-900">Data Kode Ads</h3>
								<p className="text-sm text-slate-600">Kelola kode iklan dan kampanye</p>
							</div>
						</div>
						<div className="text-sm text-slate-500">
							Total: <span className="font-medium text-slate-900">{filteredAdsCodes.length}</span> kode ads
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
										<Code className="h-4 w-4 text-slate-500" />
										<span>Kode Ads</span>
									</div>
								</TableHead>
								<TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
									<div className="flex items-center gap-2">
										<span>Nama Kampanye</span>
									</div>
								</TableHead>
								<TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
									<div className="flex items-center gap-2">
										<span>Tanggal Dibuat</span>
									</div>
								</TableHead>
								<TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
									<div className="flex items-center gap-2">
										<span>Terakhir Update</span>
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
							{filteredAdsCodes.length > 0 ? (
								filteredAdsCodes.map((ads, index) => (
									<TableRow key={ads.id} className="transition-all duration-200 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
										<TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
											<div className="flex items-center gap-3">
												<div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
													{ads.code.charAt(0).toUpperCase()}
												</div>
												<div>
													<div className="font-semibold text-slate-900">{ads.code}</div>
													<div className="text-sm text-slate-500">ID: {ads.id}</div>
												</div>
											</div>
										</TableCell>
										<TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
											<div className="text-slate-700">
												{ads.name || (
													<span className="text-slate-400 italic">-</span>
												)}
											</div>
										</TableCell>
										<TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
											<div className="text-slate-700">
												{new Date(ads.createdAt).toLocaleDateString("id-ID", { 
													day: "numeric", 
													month: "long", 
													year: "numeric" 
												})}
											</div>
										</TableCell>
										<TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
											<div className="text-slate-700">
												{new Date(ads.updatedAt).toLocaleDateString("id-ID", { 
													day: "numeric", 
													month: "long", 
													year: "numeric" 
												})}
											</div>
										</TableCell>
										<TableCell className="py-4 px-6">
											<div className="flex items-center justify-center gap-2">
												{(() => {
													const isUsed = checkDataUsage('adsCode', ads.id);
													return (
														<>
															<Button 
																variant="ghost" 
																size="sm" 
																onClick={isUsed ? undefined : () => openEditModal(ads)}
																disabled={isUsed}
																className={`h-8 w-8 p-0 rounded-lg ${
																	isUsed 
																		? 'cursor-not-allowed opacity-50 bg-gray-100 text-gray-400' 
																		: 'hover:bg-yellow-50 hover:text-yellow-600'
																}`}
																title={isUsed ? "Tombol tidak bisa digunakan karena data sudah dipakai di data lain" : "Edit Kode Ads"}
															>
																<Edit3 className="h-4 w-4" />
															</Button>
															<Button 
																variant="ghost" 
																size="sm" 
																onClick={isUsed ? undefined : () => openDeleteModal(ads)}
																disabled={isUsed}
																className={`h-8 w-8 p-0 rounded-lg ${
																	isUsed 
																		? 'cursor-not-allowed opacity-50 bg-gray-100 text-gray-400' 
																		: 'text-red-500 hover:bg-red-50 hover:text-red-700'
																}`}
																title={isUsed ? "Tombol tidak bisa digunakan karena data sudah dipakai di data lain" : "Hapus Kode Ads"}
															>
																<Trash2 className="h-4 w-4" />
															</Button>
														</>
													);
												})()}
											</div>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={5} className="py-12 text-center">
										<div className="flex flex-col items-center justify-center text-slate-500">
											<div className="p-4 bg-slate-100 rounded-full mb-4">
												<Code className="h-8 w-8 text-slate-400" />
											</div>
											<p className="text-lg font-medium text-slate-600 mb-1">Tidak ada kode ads ditemukan</p>
											<p className="text-sm text-slate-500">Coba ubah kata kunci pencarian atau tambah kode ads baru</p>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>

				{/* Table Footer */}
				<div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
					<div className="flex items-center justify-between text-sm text-slate-600">
						<div className="flex items-center gap-2">
							<Code className="h-4 w-4" />
							<span>
								Menampilkan {filteredAdsCodes.length > 0 ? '1' : '0'} hingga {filteredAdsCodes.length} dari {filteredAdsCodes.length} kode ads
							</span>
						</div>
						{filteredAdsCodes.length > 0 && (
							<div className="text-slate-500">
								Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}
							</div>
						)}
					</div>
				</div>
			</div>

			{/* Delete Confirmation Modal */}
			{showDeleteModal && adsCodeToDelete && (
				<div 
					className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
					onClick={(e) => {
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
									Apakah Anda yakin ingin menghapus kode ads ini?
								</p>
								<div className="bg-white border border-red-200 rounded-lg p-3">
									<p className="font-semibold text-slate-900">{adsCodeToDelete.code}</p>
									<p className="text-sm text-slate-600">Kampanye: {adsCodeToDelete.name || 'Tidak ada nama kampanye'}</p>
									<p className="text-sm text-slate-600">ID: {adsCodeToDelete.id}</p>
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
									onClick={handleDeleteAdsCode}
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

			{/* Notification Toast */}
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

			<style jsx>{`
				@keyframes progressBar {
					from { width: 100%; }
					to { width: 0%; }
				}
				
				@keyframes slide-in-from-top-4 {
					from { 
						transform: translateY(-1rem);
						opacity: 0;
					}
					to { 
						transform: translateY(0);
						opacity: 1;
					}
				}
				
				@keyframes zoom-in {
					from { 
						transform: scale(0.95);
					}
					to { 
						transform: scale(1);
					}
				}
				
				@keyframes fade-in {
					from { opacity: 0; }
					to { opacity: 1; }
				}
				
				.animate-in {
					animation: slide-in-from-top-4 0.3s ease-out, zoom-in 0.3s ease-out, fade-in 0.3s ease-out;
				}
			`}</style>
		</div>
	);
}

function LeadSourceTab({ leadSources }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingLeadSource, setEditingLeadSource] = useState(null);
  const [editForm, setEditForm] = useState({ name: "" });
  const [editError, setEditError] = useState("");

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [leadSourceToDelete, setLeadSourceToDelete] = useState(null);

  // Lead sources data state
  const [leadSourcesList, setLeadSourcesList] = useState(leadSources);

  // Notification state
  const [notification, setNotification] = useState(null);

  const filteredLeadSources = leadSourcesList.filter(leadSource =>
    leadSource.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openModal() {
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm({ name: "" });
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) {
      setError("Sumber Leads wajib diisi.");
      return;
    }
    
    const newLeadSource = {
      id: Date.now(),
      name: form.name,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setLeadSourcesList(prev => [...prev, newLeadSource]);
    showNotification("Data Sumber Leads berhasil ditambahkan.", "success");
    closeModal();
  }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const openDeleteModal = (leadSource) => {
    setLeadSourceToDelete(leadSource);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setLeadSourceToDelete(null);
  };

  const handleDeleteLeadSource = () => {
    if (leadSourceToDelete) {
      // Backend validation: Check if lead source is still being used
      const isUsed = checkDataUsage('leadSource', leadSourceToDelete.id);
      if (isUsed) {
        showNotification("Data sumber leads tidak dapat dihapus karena masih digunakan di data lain.", "error");
        closeDeleteModal();
        return;
      }
      
      setLeadSourcesList(prev => prev.filter(leadSource => leadSource.id !== leadSourceToDelete.id));
      showNotification("Data Sumber Leads berhasil dihapus.", "success");
      closeDeleteModal();
    }
  };

  // Edit modal functions
  const openEditModal = (leadSource) => {
    setEditingLeadSource(leadSource);
    setEditForm({ name: leadSource.name });
    setEditError("");
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setEditingLeadSource(null);
    setEditForm({ name: "" });
    setEditError("");
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    if (!editForm.name) {
      setEditError("Sumber Leads wajib diisi.");
      return;
    }
    
    // Backend validation: Check if lead source is still being used
    const isUsed = checkDataUsage('leadSource', editingLeadSource.id);
    if (isUsed) {
      setEditError("Data sumber leads tidak dapat diubah karena masih digunakan di data lain.");
      return;
    }
    
    setLeadSourcesList(prev => 
      prev.map(leadSource => 
        leadSource.id === editingLeadSource.id 
          ? { ...leadSource, name: editForm.name, updatedAt: new Date().toISOString().split('T')[0] }
          : leadSource
      )
    );
    
    showNotification("Data Sumber Leads berhasil diperbarui.", "success");
    closeEditModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari sumber leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200 h-10 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white" 
          onClick={openModal}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Tambah Sumber Leads
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-gray-800">Tambah Sumber Leads Baru</h3>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Sumber Leads <span className="text-red-500">*</span></label>
                <Input 
                  type="text" 
                  placeholder="Masukkan nama sumber leads" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="border-gray-300 focus:border-blue-500"
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Container - Modern style matching User tab */}
      <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Target className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Data Sumber Leads</h3>
                <p className="text-sm text-slate-600">Kelola sumber leads marketing</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Total: <span className="font-medium text-slate-900">{filteredLeadSources.length}</span> sumber leads
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
                    <Target className="h-4 w-4 text-slate-500" />
                    <span>Sumber Leads</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <span>Tanggal Dibuat</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <span>Terakhir Update</span>
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
              {filteredLeadSources.length > 0 ? (
                filteredLeadSources.map((leadSource, index) => (
                  <TableRow key={leadSource.id} className="transition-all duration-200 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                    <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {leadSource.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{leadSource.name}</div>
                          <div className="text-sm text-slate-500">ID: {leadSource.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                      <div className="text-slate-700">
                        {new Date(leadSource.createdAt).toLocaleDateString("id-ID", { 
                          day: "numeric", 
                          month: "long", 
                          year: "numeric" 
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                      <div className="text-slate-700">
                        {new Date(leadSource.updatedAt).toLocaleDateString("id-ID", { 
                          day: "numeric", 
                          month: "long", 
                          year: "numeric" 
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {(() => {
                          const isUsed = checkDataUsage('leadSource', leadSource.id);
                          return (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={isUsed ? undefined : () => openEditModal(leadSource)}
                                disabled={isUsed}
                                className={`h-8 w-8 p-0 rounded-lg ${
                                  isUsed 
                                    ? 'cursor-not-allowed opacity-50 bg-gray-100 text-gray-400' 
                                    : 'hover:bg-yellow-50 hover:text-yellow-600'
                                }`}
                                title={isUsed ? "Tombol tidak bisa digunakan karena data sudah dipakai di data lain" : "Edit Sumber Leads"}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={isUsed ? undefined : () => openDeleteModal(leadSource)}
                                disabled={isUsed}
                                className={`h-8 w-8 p-0 rounded-lg ${
                                  isUsed 
                                    ? 'cursor-not-allowed opacity-50 bg-gray-100 text-gray-400' 
                                    : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                                }`}
                                title={isUsed ? "Tombol tidak bisa digunakan karena data sudah dipakai di data lain" : "Hapus Sumber Leads"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          );
                        })()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="p-4 bg-slate-100 rounded-full mb-4">
                        <Target className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-600 mb-1">Tidak ada sumber leads ditemukan</p>
                      <p className="text-sm text-slate-500">Coba ubah kata kunci pencarian atau tambah sumber leads baru</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span>
                Menampilkan {filteredLeadSources.length > 0 ? '1' : '0'} hingga {filteredLeadSources.length} dari {filteredLeadSources.length} sumber leads
              </span>
            </div>
            {filteredLeadSources.length > 0 && (
              <div className="text-slate-500">
                Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingLeadSource && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeEditModal();
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-b border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Edit Sumber Leads</h3>
              <p className="text-sm text-slate-600">Perbarui informasi sumber leads</p>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Sumber Leads <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Masukkan nama sumber leads"
                    className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {editError && (
                    <p className="text-red-600 text-sm mt-1">{editError}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeEditModal}>Batal</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && leadSourceToDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
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
                  Apakah Anda yakin ingin menghapus sumber leads ini?
                </p>
                <div className="bg-white border border-red-200 rounded-lg p-3">
                  <p className="font-semibold text-slate-900">{leadSourceToDelete.name}</p>
                  <p className="text-sm text-slate-600">ID: {leadSourceToDelete.id}</p>
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
                  onClick={handleDeleteLeadSource}
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

      {/* Notification Toast */}
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

      <style jsx>{`
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes slide-in-from-top-4 {
          from { 
            transform: translateY(-1rem);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes zoom-in {
          from { 
            transform: scale(0.95);
          }
          to { 
            transform: scale(1);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-in {
          animation: slide-in-from-top-4 0.3s ease-out, zoom-in 0.3s ease-out, fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function FaskesTypeTab({ faskesTypes }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [faskesTypeToDelete, setFaskesTypeToDelete] = useState(null);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [faskesTypeToEdit, setFaskesTypeToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Faskes types data state
  const [faskesTypesList, setFaskesTypesList] = useState(faskesTypes);

  // Notification state
  const [notification, setNotification] = useState(null);

  const filteredFaskesTypes = faskesTypesList.filter(faskesType =>
    faskesType.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openModal() {
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm({ name: "" });
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) {
      setError("Tipe Faskes wajib diisi.");
      return;
    }
    
    const newFaskesType = {
      id: Date.now(),
      name: form.name,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setFaskesTypesList(prev => [...prev, newFaskesType]);
    showNotification("Data Tipe Faskes berhasil ditambahkan.", "success");
    closeModal();
  }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const openDeleteModal = (faskesType) => {
    setFaskesTypeToDelete(faskesType);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setFaskesTypeToDelete(null);
  };

  const handleDeleteFaskesType = () => {
    if (faskesTypeToDelete) {
      // Backend validation: Check if facility type is still being used
      const isUsed = checkDataUsage('facilityType', faskesTypeToDelete.id);
      if (isUsed) {
        showNotification("Data tipe faskes tidak dapat dihapus karena masih digunakan di data lain.", "error");
        closeDeleteModal();
        return;
      }
      
      setFaskesTypesList(prev => prev.filter(faskesType => faskesType.id !== faskesTypeToDelete.id));
      showNotification("Data Tipe Faskes berhasil dihapus.", "success");
      closeDeleteModal();
    }
  };

  const openEditModal = (faskesType) => {
    setFaskesTypeToEdit(faskesType);
    setEditForm({ name: faskesType.name });
    setErrors({});
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setFaskesTypeToEdit(null);
    setEditForm({ name: "" });
    setErrors({});
  };

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};
    if (!editForm.name.trim()) {
      newErrors.name = "Nama tipe faskes wajib diisi";
    }
    return newErrors;
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateEditForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Backend validation: Check if facility type is still being used
    const isUsed = checkDataUsage('facilityType', faskesTypeToEdit.id);
    if (isUsed) {
      setErrors({ name: "Data tipe faskes tidak dapat diubah karena masih digunakan di data lain." });
      return;
    }

    setFaskesTypesList(prev => prev.map(faskesType => 
      faskesType.id === faskesTypeToEdit.id 
        ? { 
            ...faskesType, 
            name: editForm.name.trim(),
            updatedAt: new Date().toISOString().split('T')[0]
          } 
        : faskesType
    ));
    showNotification("Data Tipe Faskes berhasil diperbarui.", "success");
    closeEditModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari tipe faskes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200 h-10 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white" 
          onClick={openModal}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Tambah Tipe Faskes
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-gray-800">Tambah Tipe Faskes Baru</h3>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Tipe Faskes <span className="text-red-500">*</span></label>
                <Input 
                  type="text" 
                  placeholder="Masukkan nama tipe faskes" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="border-gray-300 focus:border-blue-500"
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Container - Modern style matching User tab */}
      <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Building className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Data Tipe Faskes</h3>
                <p className="text-sm text-slate-600">Kelola tipe fasilitas kesehatan</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Total: <span className="font-medium text-slate-900">{filteredFaskesTypes.length}</span> tipe faskes
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
                    <Building className="h-4 w-4 text-slate-500" />
                    <span>Tipe Faskes</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <span>Tanggal Dibuat</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <span>Terakhir Update</span>
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
              {filteredFaskesTypes.length > 0 ? (
                filteredFaskesTypes.map((faskesType, index) => (
                  <TableRow key={faskesType.id} className="transition-all duration-200 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                    <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {faskesType.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{faskesType.name}</div>
                          <div className="text-sm text-slate-500">ID: {faskesType.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                      <div className="text-slate-700">
                        {new Date(faskesType.createdAt).toLocaleDateString("id-ID", { 
                          day: "numeric", 
                          month: "long", 
                          year: "numeric" 
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                      <div className="text-slate-700">
                        {new Date(faskesType.updatedAt).toLocaleDateString("id-ID", { 
                          day: "numeric", 
                          month: "long", 
                          year: "numeric" 
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {(() => {
                          const isUsed = checkDataUsage('facilityType', faskesType.id);
                          return (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={isUsed ? undefined : () => openEditModal(faskesType)}
                                disabled={isUsed}
                                className={`h-8 w-8 p-0 rounded-lg ${
                                  isUsed 
                                    ? 'cursor-not-allowed opacity-50 bg-gray-100 text-gray-400' 
                                    : 'hover:bg-yellow-50 hover:text-yellow-600'
                                }`}
                                title={isUsed ? "Tombol tidak bisa digunakan karena data sudah dipakai di data lain" : "Edit Tipe Faskes"}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={isUsed ? undefined : () => openDeleteModal(faskesType)}
                                disabled={isUsed}
                                className={`h-8 w-8 p-0 rounded-lg ${
                                  isUsed 
                                    ? 'cursor-not-allowed opacity-50 bg-gray-100 text-gray-400' 
                                    : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                                }`}
                                title={isUsed ? "Tombol tidak bisa digunakan karena data sudah dipakai di data lain" : "Hapus Tipe Faskes"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          );
                        })()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="p-4 bg-slate-100 rounded-full mb-4">
                        <Building className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-600 mb-1">Tidak ada tipe faskes ditemukan</p>
                      <p className="text-sm text-slate-500">Coba ubah kata kunci pencarian atau tambah tipe faskes baru</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Building className="h-4 w-4" />
              <span>
                Menampilkan {filteredFaskesTypes.length > 0 ? '1' : '0'} hingga {filteredFaskesTypes.length} dari {filteredFaskesTypes.length} tipe faskes
              </span>
            </div>
            {filteredFaskesTypes.length > 0 && (
              <div className="text-slate-500">
                Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && faskesTypeToEdit && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeEditModal();
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Edit Tipe Faskes</h3>
              <p className="text-sm text-slate-600">Perbarui informasi tipe faskes</p>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Tipe Faskes <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Masukkan nama tipe faskes"
                    className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeEditModal}>Batal</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && faskesTypeToDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
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

            <div className="px-6 pb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-slate-900 mb-2">
                  Apakah Anda yakin ingin menghapus tipe faskes ini?
                </p>
                <div className="bg-white border border-red-200 rounded-lg p-3">
                  <p className="font-semibold text-slate-900">{faskesTypeToDelete.name}</p>
                  <p className="text-sm text-slate-600">ID: {faskesTypeToDelete.id}</p>
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

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={closeDeleteModal}
                  className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleDeleteFaskesType}
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

      {/* Notification Toast */}
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

      <style jsx>{`
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes slide-in-from-top-4 {
          from { 
            transform: translateY(-1rem);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes zoom-in {
          from { 
            transform: scale(0.95);
          }
          to { 
            transform: scale(1);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-in {
          animation: slide-in-from-top-4 0.3s ease-out, zoom-in 0.3s ease-out, fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function LeadStatusTab({ leadStatus }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [statusToDelete, setStatusToDelete] = useState(null);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [statusToEdit, setStatusToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Status data state
  const [statusList, setStatusList] = useState(leadStatus);

  // Notification state
  const [notification, setNotification] = useState(null);

  const filteredStatus = statusList.filter(status =>
    status.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openModal() {
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm({ name: "" });
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) {
      setError("Status Leads wajib diisi.");
      return;
    }
    
    const newStatus = {
      id: Date.now(),
      name: form.name,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setStatusList(prev => [...prev, newStatus]);
    showNotification("Data Status Leads berhasil ditambahkan.", "success");
    closeModal();
  }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const openDeleteModal = (status) => {
    setStatusToDelete(status);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setStatusToDelete(null);
  };

  const handleDeleteStatus = () => {
    if (statusToDelete) {
      // Backend validation: Check if lead status is still being used
      const isUsed = checkDataUsage('leadStatus', statusToDelete.id);
      if (isUsed) {
        showNotification("Data status leads tidak dapat dihapus karena masih digunakan di data lain.", "error");
        closeDeleteModal();
        return;
      }
      
      setStatusList(prev => prev.filter(status => status.id !== statusToDelete.id));
      showNotification("Data Status Leads berhasil dihapus.", "success");
      closeDeleteModal();
    }
  };

  const openEditModal = (status) => {
    setStatusToEdit(status);
    setEditForm({ name: status.name });
    setErrors({});
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setStatusToEdit(null);
    setEditForm({ name: "" });
    setErrors({});
  };

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};
    if (!editForm.name.trim()) {
      newErrors.name = "Nama status leads wajib diisi";
    }
    return newErrors;
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateEditForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Backend validation - cek apakah data sudah digunakan di data lain
    const isUsed = checkDataUsage('leadStatus', statusToEdit.id);
    if (isUsed) {
      setErrors({ name: 'Data status leads tidak dapat diubah karena masih digunakan di data lain.' });
      return;
    }

    setStatusList(prev => prev.map(status => 
      status.id === statusToEdit.id 
        ? { 
            ...status, 
            name: editForm.name.trim(),
            updatedAt: new Date().toISOString().split('T')[0]
          } 
        : status
    ));
    showNotification("Data Status Leads berhasil diperbarui.", "success");
    closeEditModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari status leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200 h-10 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white" 
          onClick={openModal}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Tambah Status Leads
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-gray-800">Tambah Status Leads Baru</h3>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Status Leads <span className="text-red-500">*</span></label>
                <Input 
                  type="text" 
                  placeholder="Masukkan nama status leads" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="border-gray-300 focus:border-blue-500"
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Container - Modern style matching User tab */}
      <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Flag className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Data Status Leads</h3>
                <p className="text-sm text-slate-600">Kelola status perjalanan leads</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Total: <span className="font-medium text-slate-900">{filteredStatus.length}</span> status leads
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
                    <Flag className="h-4 w-4 text-slate-500" />
                    <span>Status Leads</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <span>Tanggal Dibuat</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <span>Terakhir Update</span>
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
              {filteredStatus.length > 0 ? (
                filteredStatus.map((status, index) => (
                  <TableRow key={status.id} className="transition-all duration-200 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                    <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {status.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{status.name}</div>
                          <div className="text-sm text-slate-500">ID: {status.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                      <div className="text-slate-700">
                        {new Date(status.createdAt).toLocaleDateString("id-ID", { 
                          day: "numeric", 
                          month: "long", 
                          year: "numeric" 
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                      <div className="text-slate-700">
                        {new Date(status.updatedAt).toLocaleDateString("id-ID", { 
                          day: "numeric", 
                          month: "long", 
                          year: "numeric" 
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {(() => {
                          const isUsed = checkDataUsage('leadStatus', status.id);
                          return (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={isUsed ? undefined : () => openEditModal(status)}
                                disabled={isUsed}
                                className={`h-8 w-8 p-0 rounded-lg ${
                                  isUsed 
                                    ? 'cursor-not-allowed opacity-50 bg-gray-100 text-gray-400' 
                                    : 'hover:bg-yellow-50 hover:text-yellow-600'
                                }`}
                                title={isUsed ? "Tombol tidak bisa digunakan karena data sudah dipakai di data lain" : "Edit Status Leads"}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={isUsed ? undefined : () => openDeleteModal(status)}
                                disabled={isUsed}
                                className={`h-8 w-8 p-0 rounded-lg ${
                                  isUsed 
                                    ? 'cursor-not-allowed opacity-50 bg-gray-100 text-gray-400' 
                                    : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                                }`}
                                title={isUsed ? "Tombol tidak bisa digunakan karena data sudah dipakai di data lain" : "Hapus Status Leads"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          );
                        })()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="p-4 bg-slate-100 rounded-full mb-4">
                        <Flag className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-600 mb-1">Tidak ada status leads ditemukan</p>
                      <p className="text-sm text-slate-500">Coba ubah kata kunci pencarian atau tambah status leads baru</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <Flag className="h-4 w-4" />
              <span>
                Menampilkan {filteredStatus.length > 0 ? '1' : '0'} hingga {filteredStatus.length} dari {filteredStatus.length} status leads
              </span>
            </div>
            {filteredStatus.length > 0 && (
              <div className="text-slate-500">
                Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && statusToEdit && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeEditModal();
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-b border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Edit Status Leads</h3>
              <p className="text-sm text-slate-600">Perbarui informasi status leads</p>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Status Leads <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Masukkan nama status leads"
                    className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeEditModal}>Batal</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && statusToDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
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

            <div className="px-6 pb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-slate-900 mb-2">
                  Apakah Anda yakin ingin menghapus status leads ini?
                </p>
                <div className="bg-white border border-red-200 rounded-lg p-3">
                  <p className="font-semibold text-slate-900">{statusToDelete.name}</p>
                  <p className="text-sm text-slate-600">ID: {statusToDelete.id}</p>
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

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={closeDeleteModal}
                  className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleDeleteStatus}
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

      {/* Notification Toast */}
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
              <div className={`
                h-2 w-full rounded-t-2xl
                ${notification.type === 'success' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-red-500 to-rose-500'
                }
              `}></div>
              
              <div className="px-6 sm:px-8 py-5 sm:py-6">
                <div className="flex items-start gap-3 sm:gap-4">
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

      <style jsx>{`
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes slide-in-from-top-4 {
          from { 
            transform: translateY(-1rem);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes zoom-in {
          from { 
            transform: scale(0.95);
          }
          to { 
            transform: scale(1);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-in {
          animation: slide-in-from-top-4 0.3s ease-out, zoom-in 0.3s ease-out, fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

function NotLeadsTab({ notLeads }) {
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "" });
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Delete confirmation modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notLeadToDelete, setNotLeadToDelete] = useState(null);

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [notLeadToEdit, setNotLeadToEdit] = useState(null);
  const [editForm, setEditForm] = useState({ name: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Not leads data state
  const [notLeadsList, setNotLeadsList] = useState(notLeads);

  // Notification state
  const [notification, setNotification] = useState(null);

  const filteredNotLeads = notLeadsList.filter(notLead =>
    notLead.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  function openModal() {
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setForm({ name: "" });
    setError("");
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) {
      setError("Bukan Leads wajib diisi.");
      return;
    }
    
    const newNotLead = {
      id: Date.now(),
      name: form.name,
      createdAt: new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString().split('T')[0]
    };
    setNotLeadsList(prev => [...prev, newNotLead]);
    showNotification("Data Bukan Leads berhasil ditambahkan.", "success");
    closeModal();
  }

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  const openDeleteModal = (notLead) => {
    setNotLeadToDelete(notLead);
    setShowDeleteModal(true);
  };

  const closeDeleteModal = () => {
    setShowDeleteModal(false);
    setNotLeadToDelete(null);
  };

  const handleDeleteNotLead = () => {
    if (notLeadToDelete) {
      // Backend validation - cek apakah data sudah digunakan di data lain
      const isUsed = checkDataUsage('notLead', notLeadToDelete.id);
      if (isUsed) {
        showNotification("Data bukan leads tidak dapat dihapus karena masih digunakan di data lain.", "error");
        closeDeleteModal();
        return;
      }

      setNotLeadsList(prev => prev.filter(notLead => notLead.id !== notLeadToDelete.id));
      showNotification("Data Bukan Leads berhasil dihapus.", "success");
      closeDeleteModal();
    }
  };

  const openEditModal = (notLead) => {
    setNotLeadToEdit(notLead);
    setEditForm({ name: notLead.name });
    setErrors({});
    setShowEditModal(true);
  };

  const closeEditModal = () => {
    setShowEditModal(false);
    setNotLeadToEdit(null);
    setEditForm({ name: "" });
    setErrors({});
  };

  const validateEditForm = () => {
    const newErrors: Record<string, string> = {};
    if (!editForm.name.trim()) {
      newErrors.name = "Nama bukan leads wajib diisi";
    }
    return newErrors;
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    const formErrors = validateEditForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }

    // Backend validation - cek apakah data sudah digunakan di data lain
    const isUsed = checkDataUsage('notLead', notLeadToEdit.id);
    if (isUsed) {
      setErrors({ name: 'Data bukan leads tidak dapat diubah karena masih digunakan di data lain.' });
      return;
    }

    setNotLeadsList(prev => prev.map(notLead => 
      notLead.id === notLeadToEdit.id 
        ? { 
            ...notLead, 
            name: editForm.name.trim(),
            updatedAt: new Date().toISOString().split('T')[0]
          } 
        : notLead
    ));
    showNotification("Data Bukan Leads berhasil diperbarui.", "success");
    closeEditModal();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            type="text"
            placeholder="Cari bukan leads..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-slate-50 border-slate-200 h-10 w-full focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
          />
        </div>
        <Button 
          className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white" 
          onClick={openModal}
        >
          <PlusCircle className="h-4 w-4 mr-2" />
          Tambah Bukan Leads
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/50" onClick={closeModal}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-bold mb-6 text-gray-800">Tambah Bukan Leads Baru</h3>
            <form className="space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-700">Bukan Leads <span className="text-red-500">*</span></label>
                <Input 
                  type="text" 
                  placeholder="Masukkan nama bukan leads" 
                  value={form.name} 
                  onChange={(e) => setForm({ ...form, name: e.target.value })} 
                  className="border-gray-300 focus:border-blue-500"
                />
                {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeModal}>Batal</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table Container - Modern style matching User tab */}
      <div className="bg-white shadow-lg rounded-2xl border border-slate-200 overflow-hidden">
        {/* Table Header */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <UserX className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Data Bukan Leads</h3>
                <p className="text-sm text-slate-600">Kelola kategori bukan leads</p>
              </div>
            </div>
            <div className="text-sm text-slate-500">
              Total: <span className="font-medium text-slate-900">{filteredNotLeads.length}</span> bukan leads
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
                    <UserX className="h-4 w-4 text-slate-500" />
                    <span>Bukan Leads</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <span>Tanggal Dibuat</span>
                  </div>
                </TableHead>
                <TableHead className="py-4 px-6 text-left font-semibold text-slate-700 border-r border-slate-200 last:border-r-0">
                  <div className="flex items-center gap-2">
                    <span>Terakhir Update</span>
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
              {filteredNotLeads.length > 0 ? (
                filteredNotLeads.map((notLead, index) => (
                  <TableRow key={notLead.id} className="transition-all duration-200 hover:bg-slate-50 border-b border-slate-100 last:border-b-0">
                    <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                          {notLead.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900">{notLead.name}</div>
                          <div className="text-sm text-slate-500">ID: {notLead.id}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                      <div className="text-slate-700">
                        {new Date(notLead.createdAt).toLocaleDateString("id-ID", { 
                          day: "numeric", 
                          month: "long", 
                          year: "numeric" 
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6 border-r border-slate-100 last:border-r-0">
                      <div className="text-slate-700">
                        {new Date(notLead.updatedAt).toLocaleDateString("id-ID", { 
                          day: "numeric", 
                          month: "long", 
                          year: "numeric" 
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="py-4 px-6">
                      <div className="flex items-center justify-center gap-2">
                        {(() => {
                          const isUsed = checkDataUsage('notLead', notLead.id);
                          return (
                            <>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openEditModal(notLead)}
                                disabled={isUsed}
                                className={`h-8 w-8 p-0 rounded-lg ${
                                  isUsed 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'hover:bg-yellow-50 hover:text-yellow-600'
                                }`}
                                title={isUsed ? "Tombol tidak bisa digunakan karena data sudah dipakai di data lain" : "Edit Bukan Leads"}
                              >
                                <Edit3 className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => openDeleteModal(notLead)}
                                disabled={isUsed}
                                className={`h-8 w-8 p-0 rounded-lg ${
                                  isUsed 
                                    ? 'text-gray-300 cursor-not-allowed' 
                                    : 'text-red-500 hover:bg-red-50 hover:text-red-700'
                                }`}
                                title={isUsed ? "Tombol tidak bisa digunakan karena data sudah dipakai di data lain" : "Hapus Bukan Leads"}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          );
                        })()}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <div className="p-4 bg-slate-100 rounded-full mb-4">
                        <UserX className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-lg font-medium text-slate-600 mb-1">Tidak ada bukan leads ditemukan</p>
                      <p className="text-sm text-slate-500">Coba ubah kata kunci pencarian atau tambah bukan leads baru</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Table Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <div className="flex items-center gap-2">
              <UserX className="h-4 w-4" />
              <span>
                Menampilkan {filteredNotLeads.length > 0 ? '1' : '0'} hingga {filteredNotLeads.length} dari {filteredNotLeads.length} bukan leads
              </span>
            </div>
            {filteredNotLeads.length > 0 && (
              <div className="text-slate-500">
                Terakhir diperbarui: {new Date().toLocaleDateString("id-ID")}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && notLeadToEdit && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeEditModal();
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg border border-slate-200 max-h-[90vh] overflow-auto">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-b border-slate-200 p-6">
              <h3 className="text-xl font-bold text-slate-900 mb-1">Edit Bukan Leads</h3>
              <p className="text-sm text-slate-600">Perbarui informasi bukan leads</p>
            </div>
            <form onSubmit={handleEditSubmit} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Nama Bukan Leads <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="name"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Masukkan nama bukan leads"
                    className="w-full border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  {errors.name && (
                    <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={closeEditModal}>Batal</Button>
                <Button type="submit" className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white">Simpan</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && notLeadToDelete && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeDeleteModal();
            }
          }}
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in fade-in zoom-in duration-200">
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

            <div className="px-6 pb-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <p className="text-slate-900 mb-2">
                  Apakah Anda yakin ingin menghapus bukan leads ini?
                </p>
                <div className="bg-white border border-red-200 rounded-lg p-3">
                  <p className="font-semibold text-slate-900">{notLeadToDelete.name}</p>
                  <p className="text-sm text-slate-600">ID: {notLeadToDelete.id}</p>
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

              <div className="flex gap-3 justify-end">
                <Button
                  variant="outline"
                  onClick={closeDeleteModal}
                  className="px-6 py-2 border-slate-300 text-slate-700 hover:bg-slate-50"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleDeleteNotLead}
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

      {/* Notification Toast */}
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
              <div className={`
                h-2 w-full rounded-t-2xl
                ${notification.type === 'success' 
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500' 
                  : 'bg-gradient-to-r from-red-500 to-rose-500'
                }
              `}></div>
              
              <div className="px-6 sm:px-8 py-5 sm:py-6">
                <div className="flex items-start gap-3 sm:gap-4">
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

      <style jsx>{`
        @keyframes progressBar {
          from { width: 100%; }
          to { width: 0%; }
        }
        
        @keyframes slide-in-from-top-4 {
          from { 
            transform: translateY(-1rem);
            opacity: 0;
          }
          to { 
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes zoom-in {
          from { 
            transform: scale(0.95);
          }
          to { 
            transform: scale(1);
          }
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        .animate-in {
          animation: slide-in-from-top-4 0.3s ease-out, zoom-in 0.3s ease-out, fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
}

export default function DataMasterPage() {
	const [users] = useState(initialUsers);
	const [services] = useState(initialServices);
	const [products] = useState(initialProducts);
	const [adsCodes] = useState(initialAdsCodes);
	const [leadSources] = useState(initialLeadSources);
	const [faskesTypes] = useState(initialFaskesTypes);
	const [leadStatus] = useState(initialLeadStatus);
	const [notLeads] = useState(initialNotLeads);

	return (
		<ProtectedRoute allowedRoles={['super_admin']}>
			<div className="p-6 space-y-6">
				<Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100">
					<CardHeader>
						<CardTitle className="text-2xl font-bold text-gray-800 flex items-center gap-3">
							<Database className="h-8 w-8 text-blue-600" />
							Data Master
						</CardTitle>
						<CardDescription className="text-gray-600">
							Kelola semua data master yang ada di AssistLeads
						</CardDescription>
					</CardHeader>
				</Card>

			<Tabs defaultValue="users" className="w-full">
				<TabsList className="grid w-full grid-cols-4 md:grid-cols-8 bg-slate-50 border-b-2 border-slate-200 p-0 rounded-none shadow-sm">
					<TabsTrigger 
						value="users" 
						className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
					>
						<Users className="h-4 w-4" />
						<span className="hidden md:inline">User</span>
					</TabsTrigger>
					<TabsTrigger 
						value="services" 
						className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
					>
						<Target className="h-4 w-4" />
						<span className="hidden md:inline">Layanan</span>
					</TabsTrigger>
					<TabsTrigger 
						value="products" 
						className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
					>
						<Package className="h-4 w-4" />
						<span className="hidden md:inline">Produk</span>
					</TabsTrigger>
					<TabsTrigger 
						value="ads-codes" 
						className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
					>
						<Code className="h-4 w-4" />
						<span className="hidden md:inline">Kode Ads</span>
					</TabsTrigger>
					<TabsTrigger 
						value="lead-sources" 
						className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
					>
						<Target className="h-4 w-4" />
						<span className="hidden md:inline">Sumber Leads</span>
					</TabsTrigger>
					<TabsTrigger 
						value="faskes-types" 
						className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
					>
						<Building className="h-4 w-4" />
						<span className="hidden md:inline">Tipe Faskes</span>
					</TabsTrigger>
					<TabsTrigger 
						value="lead-status" 
						className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
					>
						<Flag className="h-4 w-4" />
						<span className="hidden md:inline">Status Leads</span>
					</TabsTrigger>
					<TabsTrigger 
						value="not-leads" 
						className="flex items-center justify-center gap-2 py-4 px-4 font-semibold text-slate-700 hover:bg-blue-50 hover:text-blue-600 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:border-b-2 data-[state=active]:border-blue-600 data-[state=active]:font-bold transition-all duration-200 border-b-2 border-transparent"
					>
						<UserX className="h-4 w-4" />
						<span className="hidden md:inline">Bukan Leads</span>
					</TabsTrigger>
				</TabsList>

				<TabsContent value="users" className="mt-6">
					<UserTab />
				</TabsContent>
				<TabsContent value="services" className="mt-6">
					<LayananTab />
				</TabsContent>
				<TabsContent value="products" className="mt-6">
					<ProdukTab />
				</TabsContent>
				<TabsContent value="ads-codes" className="mt-6">
					<KodeAdsTab />
				</TabsContent>
				<TabsContent value="lead-sources" className="mt-6">
					<SumberLeadsTab />
				</TabsContent>
				<TabsContent value="faskes-types" className="mt-6">
					<TipeFaskesTab />
				</TabsContent>
				<TabsContent value="lead-status" className="mt-6">
					<StatusLeadsTab />
				</TabsContent>
				<TabsContent value="not-leads" className="mt-6">
					<BukanLeadsTab />
				</TabsContent>
			</Tabs>
		</div>
		</ProtectedRoute>
	);
}
