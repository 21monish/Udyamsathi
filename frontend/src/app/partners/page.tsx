'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import api from '@/lib/api';
import { ChannelPartner } from '@/types';

export default function PartnersPage() {
  return (
    <Suspense fallback={<div className="container mx-auto p-12 text-center">Loading Partners...</div>}>
      <PartnersContent />
    </Suspense>
  );
}

function PartnersContent() {
  const searchParams = useSearchParams();

  const [partners, setPartners] = useState<ChannelPartner[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCoords, setUserCoords] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('ALL');
  const [schemeFilter, setSchemeFilter] = useState<string>('');
  const [excludeHighNpa, setExcludeHighNpa] = useState<boolean>(false);
  const [geoLoading, setGeoLoading] = useState(false);

  // Pre-fill scheme from query params if navigated from scheme details
  useEffect(() => {
    const s = searchParams.get('scheme');
    if (s) setSchemeFilter(s);
  }, [searchParams]);

  useEffect(() => {
    async function fetchPartners() {
      setLoading(true);
      try {
        let url = '/partners/?';
        if (userCoords) {
          url += `lat=${userCoords.lat}&lon=${userCoords.lon}&radius_km=100&`;
        }
        if (selectedType !== 'ALL') {
          url += `partner_type=${selectedType}&`;
        }
        if (selectedDistrict !== 'ALL') {
          url += `district=${selectedDistrict}&`;
        }
        if (schemeFilter) {
          url += `scheme_name=${encodeURIComponent(schemeFilter)}&`;
        }
        if (excludeHighNpa) {
          url += `exclude_high_npa=true&`;
        }

        const res = await api.get<ChannelPartner[]>(url);
        setPartners(res.data);
      } catch (err) {
        console.error('Failed to load partners:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchPartners();
  }, [userCoords, selectedType, selectedDistrict, schemeFilter, excludeHighNpa]);

  const requestLocation = () => {
    setGeoLoading(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserCoords({
            lat: pos.coords.latitude,
            lon: pos.coords.longitude,
          });
          setGeoLoading(false);
        },
        (err) => {
          console.warn('Geolocation denied or unavailable, using Ahmedabad coordinates as default demo:', err);
          setUserCoords({ lat: 23.0225, lon: 72.5714 });
          setGeoLoading(false);
        }
      );
    } else {
      setUserCoords({ lat: 23.0225, lon: 72.5714 });
      setGeoLoading(false);
    }
  };

  const districts = ['ALL', 'Ahmedabad', 'Gandhinagar', 'Vadodara', 'Surat', 'Rajkot', 'Mehsana', 'Bhavnagar', 'Jamnagar'];

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="w-[90%] max-w-[1700px] mx-auto px-4">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-sm text-blue-600 font-semibold mb-1">
              <span>AUTHORIZED DISBURSEMENT NETWORK</span>
              <span>•</span>
              <span>PARTNER ROUTER</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
              Locate Nearby Channel Partners
            </h1>
            <p className="text-gray-600 text-sm md:text-base mt-1">
              Find authorized State Channelizing Agencies (SCAs), Public Sector Banks, and RRBs
              empaneled to process your scheme application.
            </p>
          </div>

          <button
            onClick={requestLocation}
            disabled={geoLoading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold shadow-sm transition whitespace-nowrap"
          >
            {geoLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <span>📍</span>
            )}
            <span>{userCoords ? 'Location Active (Sorted by Distance)' : 'Use My Current Location'}</span>
          </button>
        </div>

        {/* Filters Box */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Partner Channel</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                <option value="ALL">All Partner Types</option>
                <option value="SCA">State Channelizing Agencies (SCA / GSCDC)</option>
                <option value="PSB">Public Sector Banks (SBI, PNB, BoB)</option>
                <option value="RRB">Regional Rural Banks (Gramin Bank)</option>
                <option value="NBFC_MFI">NBFC - Micro Finance</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">District (Gujarat / India)</label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500"
              >
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d === 'ALL' ? 'All Districts' : d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">Scheme Filter</label>
              <input
                type="text"
                placeholder="Filter by scheme name (e.g. MUDRA, NSFDC)..."
                value={schemeFilter}
                onChange={(e) => setSchemeFilter(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Quick Health Filter Bar */}
          <div className="mt-4 pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={excludeHighNpa}
                onChange={(e) => setExcludeHighNpa(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <span className="text-xs font-semibold text-gray-700">
                🛡️ Exclude High NPA (&gt;5%) & Non-Performing Branches
              </span>
            </label>
            <span className="text-[11px] text-gray-400">
              Showing {partners.length} verified disbursement offices
            </span>
          </div>
        </div>

        {/* Partners Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : partners.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <p className="text-gray-500 text-base mb-3">
              No authorized channel partners found matching your search.
            </p>
            <button
              onClick={() => {
                setSelectedType('ALL');
                setSelectedDistrict('ALL');
                setSchemeFilter('');
                setExcludeHighNpa(false);
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {partners.map((partner) => {
              const npaRate = partner.npa_rate !== undefined ? partner.npa_rate : 3.2;
              const isHighNpa = partner.is_npa_flagged || npaRate > 5.0;
              const health = partner.health_score !== undefined ? partner.health_score : 88.0;

              return (
                <div
                  key={partner.id}
                  className={`bg-white rounded-2xl border ${
                    isHighNpa ? 'border-amber-300 bg-amber-50/20' : 'border-gray-200'
                  } hover:shadow-lg transition p-6 flex flex-col justify-between`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold px-2.5 py-0.5 rounded bg-blue-100 text-blue-800">
                          {partner.type}
                        </span>
                        {isHighNpa ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 text-red-800 border border-red-200">
                            ⚠️ NPA: {npaRate}%
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200">
                            ✓ NPA: {npaRate}% Prime
                          </span>
                        )}
                      </div>
                      {partner.distance !== undefined && partner.distance !== null ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200">
                          📍 {partner.distance} km away
                        </span>
                      ) : (
                        <span className="text-xs text-gray-500">{partner.district}</span>
                      )}
                    </div>

                    <h3 className="text-lg font-bold text-gray-900 mb-1">{partner.name}</h3>
                    <p className="text-xs text-gray-600 mb-3">{partner.address}</p>

                    {/* Operational Health Metrics Bar */}
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 mb-4 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-slate-700">Health Index:</span>
                        <span className="font-extrabold text-blue-700">{health}/100</span>
                      </div>
                      <div className="w-full bg-slate-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${
                            health >= 90 ? 'bg-emerald-500' : health >= 75 ? 'bg-blue-600' : 'bg-amber-500'
                          }`}
                          style={{ width: `${Math.min(100, Math.max(10, health))}%` }}
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-500 pt-1">
                        <div>Fund Utilization: <strong className="text-slate-800">{partner.fund_utilization || 85}%</strong></div>
                        <div>Avg SLA: <strong className="text-slate-800">{partner.avg_processing_days || 14} Days</strong></div>
                      </div>
                    </div>

                    {/* Status & Contact */}
                    <div className="flex flex-wrap gap-2 text-xs mb-4">
                      <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {partner.capacity_status === 'FULL' ? 'Quota Full' : partner.capacity_status === 'LIMITED' ? 'Limited Capacity' : 'Available for Disbursal'}
                      </span>
                      {partner.phone && (
                        <span className="text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
                          📞 {partner.phone}
                        </span>
                      )}
                      {partner.working_hours && (
                        <span className="text-gray-500 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded text-[11px]">
                          🕒 {partner.working_hours}
                        </span>
                      )}
                    </div>

                    {/* Supported Schemes */}
                    <div className="mb-4">
                      <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                        Empaneled Schemes:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {partner.supported_schemes?.map((scheme, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] bg-blue-50 text-blue-900 border border-blue-100 px-2 py-0.5 rounded font-medium"
                          >
                            {scheme}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                {/* Card Actions */}
                <div className="pt-4 border-t flex items-center justify-between gap-2">
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                      `${partner.name}, ${partner.address}`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 flex items-center gap-1"
                  >
                    <span>🧭</span>
                    <span>Get Directions</span>
                  </a>
                  {partner.phone && (
                    <a
                      href={`tel:${partner.phone}`}
                      className="text-xs font-semibold px-3 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1"
                    >
                      <span>📞</span>
                      <span>Call Branch</span>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
          </div>
        )}
      </div>
    </div>
  );
}
