import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Edit2, Trash2, Search, Crown, Sparkles, X, Check } from "lucide-react";
import { Costume } from "../../types";
import { api } from "../../api/client";
import { formatCurrency } from "../../lib/utils";

export const AdminCostumes: React.FC = () => {
  const [costumes, setCostumes] = useState<Costume[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCostume, setEditingCostume] = useState<Costume | null>(null);

  // Form State
  const [sku, setSku] = useState("");
  const [name, setName] = useState("");
  const [kannadaName, setKannadaName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("full_set");
  const [characterType, setCharacterType] = useState("raja");
  const [pricePerDay, setPricePerDay] = useState<number>(1500);
  const [priceMorning, setPriceMorning] = useState<number>(700);
  const [priceEvening, setPriceEvening] = useState<number>(800);
  const [priceNight, setPriceNight] = useState<number>(1200);
  const [securityDeposit, setSecurityDeposit] = useState<number>(3000);
  const [totalUnits, setTotalUnits] = useState<number>(2);
  const [bufferDays, setBufferDays] = useState<number>(1);
  const [rentalMode, setRentalMode] = useState<"day" | "slot" | "both">("both");
  const [sizesStr, setSizesStr] = useState("Free, M, L");
  const [includesStr, setIncludesStr] = useState("Kireeta, Bhujakeerthi, Skirt");
  const [imageUrl, setImageUrl] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchCostumes = () => {
    setLoading(true);
    api.costumes
      .list({ limit: 100 })
      .then((res) => setCostumes(res.items || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCostumes();
  }, []);

  const openAddModal = () => {
    setEditingCostume(null);
    setSku(`YK-SET-${Math.floor(100 + Math.random() * 900)}`);
    setName("");
    setKannadaName("");
    setDescription("");
    setCategory("full_set");
    setCharacterType("raja");
    setPricePerDay(1800);
    setPriceMorning(800);
    setPriceEvening(1000);
    setPriceNight(1400);
    setSecurityDeposit(3000);
    setTotalUnits(2);
    setBufferDays(1);
    setRentalMode("both");
    setSizesStr("Free, M, L");
    setIncludesStr("Kireeta, Bhujakeerthi, Skirt");
    setImageUrl("/images/costumes/raja_arjuna_1.jpg");
    setIsModalOpen(true);
  };

  const openEditModal = (c: Costume) => {
    setEditingCostume(c);
    setSku(c.sku);
    setName(c.name);
    setKannadaName(c.kannada_name || "");
    setDescription(c.description);
    setCategory(c.category);
    setCharacterType(c.character_type);
    setPricePerDay(c.price_per_day);
    setPriceMorning(c.price_per_slot?.morning || 700);
    setPriceEvening(c.price_per_slot?.evening || 800);
    setPriceNight(c.price_per_slot?.night || 1200);
    setSecurityDeposit(c.security_deposit);
    setTotalUnits(c.total_units);
    setBufferDays(c.buffer_days);
    setRentalMode(c.rental_mode);
    setSizesStr(c.sizes?.join(", ") || "Free");
    setIncludesStr(c.includes?.join(", ") || "");
    setImageUrl(c.images?.[0] || "");
    setIsModalOpen(true);
  };

  const handleSaveCostume = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        sku,
        name,
        kannada_name: kannadaName,
        description,
        category,
        character_type: characterType,
        price_per_day: Number(pricePerDay),
        price_per_slot: {
          morning: Number(priceMorning),
          evening: Number(priceEvening),
          night: Number(priceNight),
        },
        security_deposit: Number(securityDeposit),
        total_units: Number(totalUnits),
        buffer_days: Number(bufferDays),
        rental_mode: rentalMode,
        is_active: true,
        sizes: sizesStr.split(",").map((s) => s.trim()).filter(Boolean),
        includes: includesStr.split(",").map((s) => s.trim()).filter(Boolean),
        images: [imageUrl.trim()].filter(Boolean),
        care_notes: "Handle gold foil carefully. Dry clean only.",
        troupe_grade: "performance",
      };

      if (editingCostume) {
        await api.admin.updateCostume(editingCostume.id, payload);
      } else {
        await api.admin.createCostume(payload);
      }

      setIsModalOpen(false);
      fetchCostumes();
    } catch (err: any) {
      alert(err.message || "Failed to save costume");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCostume = async (id: string, costumeName: string) => {
    if (!window.confirm(`Delete '${costumeName}' from inventory?`)) return;
    try {
      await api.admin.deleteCostume(id);
      fetchCostumes();
    } catch (err: any) {
      alert(err.message || "Failed to delete");
    }
  };

  const filtered = costumes.filter((c) => {
    if (categoryFilter !== "all" && c.category !== categoryFilter) return false;
    if (search.trim()) {
      const term = search.toLowerCase();
      return (
        c.name.toLowerCase().includes(term) ||
        c.sku.toLowerCase().includes(term) ||
        (c.kannada_name && c.kannada_name.includes(term))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-stone-200 gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-amber-600 block">
            Admin Inventory Portal
          </span>
          <h1 className="font-serif text-3xl font-bold text-stone-900 mt-1">Costume Wardrobe Inventory</h1>
          <p className="text-sm text-stone-500 mt-0.5">
            Manage physical units, daily rates, slot pricing, sizes, and buffer gaps.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-2.5 rounded-xl bg-red-900 hover:bg-red-800 text-amber-100 font-bold text-xs uppercase tracking-wider shadow-sm transition-colors flex items-center space-x-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Costume</span>
        </button>
      </div>

      {/* Sub-Tabs */}
      <div className="flex space-x-3 border-b border-stone-200 text-xs font-bold pb-2">
        <Link to="/admin" className="text-stone-500 hover:text-stone-900 pb-2">Dashboard</Link>
        <Link to="/admin/bookings" className="text-stone-500 hover:text-stone-900 pb-2">Bookings Manager</Link>
        <Link to="/admin/costumes" className="text-red-900 border-b-2 border-red-900 pb-2">Costume Inventory ({costumes.length})</Link>
        <Link to="/admin/calendar" className="text-stone-500 hover:text-stone-900 pb-2">Rental Schedule Calendar</Link>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Search by SKU or costume name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-stone-300 rounded-xl text-sm focus:outline-none focus:border-red-900 shadow-sm"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-4 py-2.5 bg-white border border-stone-300 rounded-xl text-xs font-semibold text-stone-700 shadow-sm focus:outline-none"
        >
          <option value="all">All Categories</option>
          <option value="full_set">Full Sets</option>
          <option value="crown">Crowns & Kireetas</option>
          <option value="ornament">Ornaments (Bhujakeerthi)</option>
          <option value="garment">Garments (Skirts/Dhotis)</option>
          <option value="weapon">Weapons & Props</option>
          <option value="accessory">Accessories & Bells</option>
        </select>
      </div>

      {/* Costumes Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-stone-700">
            <thead className="bg-stone-50 text-stone-500 uppercase tracking-wider text-[10px]">
              <tr>
                <th className="p-3">Costume Item</th>
                <th className="p-3">SKU</th>
                <th className="p-3">Category / Role</th>
                <th className="p-3">Day Rate</th>
                <th className="p-3">Overnight Slot</th>
                <th className="p-3">Deposit</th>
                <th className="p-3">Stock Units</th>
                <th className="p-3">Buffer</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filtered.map((c) => (
                <tr key={c.id} className="hover:bg-stone-50/80">
                  <td className="p-3">
                    <div className="flex items-center space-x-3">
                      {c.images && c.images[0] && (
                        <img src={c.images[0]} alt={c.name} className="w-10 h-10 rounded-lg object-cover shrink-0" />
                      )}
                      <div>
                        <span className="font-bold text-stone-900 block truncate max-w-[200px]">{c.name}</span>
                        {c.kannada_name && <span className="text-[10px] text-amber-800">{c.kannada_name}</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-semibold text-stone-600">{c.sku}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-stone-100 text-stone-800 block w-fit">
                      {c.character_type}
                    </span>
                    <span className="text-[10px] text-stone-400 capitalize">{c.category.replace("_", " ")}</span>
                  </td>
                  <td className="p-3 font-bold font-serif text-red-900">{formatCurrency(c.price_per_day)}</td>
                  <td className="p-3 font-medium text-stone-800">{formatCurrency(c.price_per_slot?.night || 1200)}</td>
                  <td className="p-3 font-semibold text-amber-900">{formatCurrency(c.security_deposit)}</td>
                  <td className="p-3 font-bold text-stone-900">{c.total_units} unit(s)</td>
                  <td className="p-3">{c.buffer_days} day(s)</td>
                  <td className="p-3 text-right space-x-1 whitespace-nowrap">
                    <button
                      onClick={() => openEditModal(c)}
                      className="p-1.5 rounded-lg text-stone-600 hover:text-stone-900 hover:bg-stone-100"
                      title="Edit costume"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCostume(c.id, c.name)}
                      className="p-1.5 rounded-lg text-stone-400 hover:text-red-700 hover:bg-red-50"
                      title="Delete costume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Costume Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-serif text-xl font-bold text-stone-900">
                {editingCostume ? `Edit ${editingCostume.name}` : "Add New Yakshagana Costume"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCostume} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">SKU</label>
                  <input
                    type="text"
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    required
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">Costume Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    placeholder="e.g. Arjuna Kirata Royal Vesha"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">Kannada Title</label>
                  <input
                    type="text"
                    value={kannadaName}
                    onChange={(e) => setKannadaName(e.target.value)}
                    placeholder="e.g. ಅರ್ಜುನ ಕಿರಾತ ರಾಜ ವೇಷ"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  >
                    <option value="full_set">Full Set</option>
                    <option value="crown">Crown / Headgear</option>
                    <option value="ornament">Ornament</option>
                    <option value="garment">Garment</option>
                    <option value="weapon">Weapon</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">Character Role</label>
                  <select
                    value={characterType}
                    onChange={(e) => setCharacterType(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  >
                    <option value="raja">Raja (King)</option>
                    <option value="rakshasa">Rakshasa (Demon)</option>
                    <option value="bannada">Bannada Vesha</option>
                    <option value="stree">Stree (Female Role)</option>
                    <option value="hanuman">Hanuman / Vanara</option>
                    <option value="rishi">Rishi / Sage</option>
                    <option value="comic">Comic / Vidushaka</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">Price per Day (₹)</label>
                  <input
                    type="number"
                    value={pricePerDay}
                    onChange={(e) => setPricePerDay(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">Night Slot Price (₹)</label>
                  <input
                    type="number"
                    value={priceNight}
                    onChange={(e) => setPriceNight(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">Security Deposit (₹)</label>
                  <input
                    type="number"
                    value={securityDeposit}
                    onChange={(e) => setSecurityDeposit(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">Physical Stock Units</label>
                  <input
                    type="number"
                    min={1}
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">Buffer Days (Gap)</label>
                  <input
                    type="number"
                    min={0}
                    value={bufferDays}
                    onChange={(e) => setBufferDays(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">Image URL</label>
                  <input
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">Included Pieces (comma separated)</label>
                  <input
                    type="text"
                    value={includesStr}
                    onChange={(e) => setIncludesStr(e.target.value)}
                    placeholder="Crown, Shoulder piece, Belt"
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">Description</label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl text-xs font-semibold hover:bg-stone-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2 bg-red-900 text-amber-100 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-red-800 disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Save Costume"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
