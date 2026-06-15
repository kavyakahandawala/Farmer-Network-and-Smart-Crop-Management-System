import React, { useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import Nav from "../Nav/Nav";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./CalendarView.css";
import Header from "../Header/Header";
import Footer from "../Footer/Footer";
import { Helmet } from "react-helmet";

const URL = "http://localhost:5000/crops";

const STAGE_COLORS = {
  Germinating: "#8ff295",
  Vegetative: "#4a7947",
  Flowering: "#f47302",
  Maturity: "#5d47d9",
  Harvesting: "#e51515",
  Completed: "#8f8e8e",
  "Pending planting": "#9aa0a6",
  default: "#7f8c8d"
};

function parseDateOnly(isoStr) {
  if (!isoStr) return null;
  const parts = isoStr.split("-");
  if (parts.length < 3) return null;
  return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
}

function getMonthWeeks(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const first = new Date(year, month, 1);
  const last = new Date(year, month + 1, 0);
  let start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  const weeks = [];
  while (true) {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      days.push(d);
    }
    weeks.push({ start: new Date(start), days });
    start.setDate(start.getDate() + 7);
    if (start > last && weeks.length >= 5) break;
  }
  return weeks;
}

function overlaps(aStart, aEnd, bStart, bEnd) {
  return !(aEnd < bStart || aStart > bEnd);
}

function colorForStage(stage) {
  return STAGE_COLORS[stage] || STAGE_COLORS.default;
}

export default function CalendarView() {
  const [crops, setCrops] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [loading, setLoading] = useState(true);

  const calendarWrapperRef = useRef(null);

  const fetchCrops = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please log in to view your crops");
        setLoading(false);
        return;
      }

      const response = await axios.get(URL, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      const data = response.data;
      const cropData = data.crops || data || [];
      setCrops(Array.isArray(cropData) ? cropData : []);
    } catch (error) {
      console.error("Failed to fetch crops:", error);
      toast.error("Failed to load crops from server.");
      setCrops([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const weeks = useMemo(() => getMonthWeeks(currentMonth), [currentMonth]);

  const weekSlices = useMemo(() => {
    const weekEvents = weeks.map(() => []);
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);

    crops.forEach((crop) => {
      const planting = parseDateOnly(crop.plantingDate);
      const harvesting = parseDateOnly(crop.harvestingDate);
      if (!planting || !harvesting) return;
      if (harvesting < monthStart || planting > monthEnd) return;

      const eventStart = planting < monthStart ? monthStart : planting;
      const eventEnd = harvesting > monthEnd ? monthEnd : harvesting;

      weeks.forEach((w, wi) => {
        const weekStart = w.days[0];
        const weekEnd = w.days[6];

        if (eventEnd < weekStart || eventStart > weekEnd) return;

        const sliceStart = eventStart < weekStart ? new Date(weekStart) : new Date(eventStart);
        const sliceEnd = eventEnd > weekEnd ? new Date(weekEnd) : new Date(eventEnd);

        const slice = {
          id: `${crop._id || Math.random()}_${wi}_${sliceStart.toISOString()}`,
          cropId: crop._id,
          title: crop.cropLabel || `${crop.cropName} (${crop.plot})`,
          cropName: crop.cropName,
          plot: crop.plot,
          growthStage: crop.growthStage,
          health: crop.healthStatus,
          weekIndex: wi,
          startDay: sliceStart.getDay(),
          endDay: sliceEnd.getDay(),
          color: colorForStage(crop.growthStage),
          plantingDate: crop.plantingDate,
          harvestingDate: crop.harvestingDate
        };
        weekEvents[wi].push(slice);
      });
    });

    const weekWithLanes = weekEvents.map((evts) => {
      evts.sort((a, b) => (a.startDay !== b.startDay ? a.startDay - b.startDay : b.endDay - a.endDay));
      const lanes = [];
      evts.forEach((e) => {
        let placed = false;
        for (let li = 0; li < lanes.length; li++) {
          let conflict = false;
          for (let other of lanes[li]) {
            if (overlaps(e.startDay, e.endDay, other.startDay, other.endDay)) {
              conflict = true;
              break;
            }
          }
          if (!conflict) {
            lanes[li].push(e);
            e.lane = li;
            placed = true;
            break;
          }
        }
        if (!placed) {
          lanes.push([e]);
          e.lane = lanes.length - 1;
        }
      });
      return { events: evts, laneCount: lanes.length || 1 };
    });

    return weekWithLanes;
  }, [weeks, crops, currentMonth]);

  function prevMonth() {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
  }
  function nextMonth() {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
  }

  function openModalForCropId(id) {
    const crop = crops.find((c) => c._id === id);
    setSelectedCrop(crop || null);
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
    setSelectedCrop(null);
  }

  const handleExportPDF = async () => {
    if (!calendarWrapperRef.current) return;
    const input = calendarWrapperRef.current;

    // Hide elements that shouldn't be in the PDF
    const hiddenEls = input.querySelectorAll(".no-print");
    hiddenEls.forEach((el) => (el.style.display = "none"));

    try {
      // Capture the calendar as an image
      const canvas = await html2canvas(input, { 
        scale: 1.5, 
        useCORS: true, 
        backgroundColor: "#0f0f0f",
        logging: false,
        allowTaint: true
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4");
      const green = [46, 125, 50];
      const now = new Date();
      const formattedDate = now.toLocaleString("en-GB", {
        dateStyle: "medium",
        timeStyle: "short",
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgProps = pdf.getImageProperties(imgData);
      
      // Calculate dimensions to fit the calendar on the page with header
      const margin = 15;
      const headerHeight = 25;
      const availableHeight = pdfHeight - margin * 2 - headerHeight;
      
      // Calculate width to maintain aspect ratio
      const imgWidth = pdfWidth - margin * 2;
      const imgHeight = (imgProps.height * imgWidth) / imgProps.width;
      
      // Add header directly on the same page
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(16);
      pdf.setTextColor(...green);
      pdf.text("AgroSphere", margin, margin + 5);

      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(8);
      pdf.setTextColor(0, 0, 0);
      pdf.text("agrosphere@gmail.com", margin, margin + 10);
      pdf.text("AgroSphere, Colombo Rd, Kurunegala", margin, margin + 14);

      pdf.setFont("helvetica", "italic");
      pdf.text(`${formattedDate}`, margin, margin + 18);

      // Add title
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      const monthYear = currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' });
      pdf.text(`Crop Calendar - ${monthYear}`, pdfWidth / 2, margin + 5, { align: "center" });

      // Draw header line
      pdf.line(margin, margin + 20, pdfWidth - margin, margin + 20);

      // Add the calendar image right below the header
      const calendarStartY = margin + headerHeight;
      
      if (imgHeight <= availableHeight) {
        // Calendar fits on one page
        pdf.addImage(imgData, "PNG", margin, calendarStartY, imgWidth, imgHeight);
        
        // Add footer
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text(
          `AgroSphere Crop Calendar - Generated on ${formattedDate}`,
          pdfWidth / 2,
          pdfHeight - 10,
          { align: "center" }
        );
      } else {
        // Calendar needs multiple pages - split vertically
        let heightLeft = imgHeight;
        let position = 0;
        let pageNumber = 1;
        
        while (heightLeft > 0) {
          if (pageNumber > 1) {
            pdf.addPage();
            // Add continuation header for subsequent pages
            pdf.setFont("helvetica", "bold");
            pdf.setFontSize(12);
            pdf.setTextColor(...green);
            pdf.text(`Crop Calendar - ${monthYear} (Page ${pageNumber})`, pdfWidth / 2, margin + 5, { align: "center" });
            pdf.setFont("helvetica", "italic");
            pdf.setFontSize(8);
            pdf.text(`Continued...`, margin, margin + 10);
            pdf.line(margin, margin + 12, pdfWidth - margin, margin + 12);
          }
          
          const pageHeight = pageNumber === 1 ? availableHeight : pdfHeight - margin * 2 - 10;
          const chunkHeight = Math.min(heightLeft, pageHeight);
          
          pdf.addImage(
            imgData, 
            "PNG", 
            margin, 
            pageNumber === 1 ? calendarStartY : margin, 
            imgWidth, 
            imgHeight,
            undefined,
            'FAST',
            0,
            position,
            imgWidth,
            chunkHeight
          );
          
          heightLeft -= chunkHeight;
          position += chunkHeight;
          pageNumber++;
        }
        
        // Add footer to last page
        pdf.setFontSize(8);
        pdf.setTextColor(100);
        pdf.text(
          `AgroSphere Crop Calendar - Generated on ${formattedDate}`,
          pdfWidth / 2,
          pdfHeight - 10,
          { align: "center" }
        );
      }

      const today = new Date().toISOString().slice(0, 10);
      pdf.save(`AgroSphere_Crop_Calendar_${today}.pdf`);
      toast.success("Calendar exported as PDF successfully!");
    } catch (err) {
      console.error("PDF export error:", err);
      toast.error("Failed to export calendar as PDF.");
    } finally {
      // Restore hidden elements
      hiddenEls.forEach((el) => (el.style.display = ""));
    }
  };

  const monthName = currentMonth.toLocaleString(undefined, { month: "long" });
  const year = currentMonth.getFullYear();

  if (loading) {
    return (
      <>
        <Helmet>
          <title>AgroSphere | Agricultural Blog</title>
        </Helmet>
        <Header />
        <div className="calendar-page">
          <Nav handleExportCalendar={handleExportPDF} />
          <div className="calendar-wrapper">
            <div className="calendar-left">
              <div className="calendar-top">
                <div>
                  <h1 className="cv-title">Crop Calendar</h1>
                  <p className="cv-sub">Visualize planting and harvest schedules at a glance</p>
                </div>
              </div>
              <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-light)' }}>
                Loading your crops...
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Helmet>
        <title>AgroSphere | Agricultural Blog</title>
      </Helmet>

      <Header />
      <div className="calendar-page">
        <Nav handleExportCalendar={handleExportPDF} />

        <div className="calendar-wrapper" ref={calendarWrapperRef}>
          <div className="calendar-left">
            <div className="calendar-top">
              <div>
                <h1 className="cv-title">Crop Calendar</h1>
                <p className="cv-sub">Visualize planting and harvest schedules at a glance</p>
                {crops.length === 0 && (
                  <p style={{ color: 'var(--muted)', fontSize: '14px', marginTop: '8px' }}>
                    No crops found. Add crops to see them in your calendar.
                  </p>
                )}
              </div>

              <div className="month-controls">
                <button className="month-btn no-print" onClick={prevMonth}>‹</button>
                <div className="month-label">{monthName} {year}</div>
                <button className="month-btn no-print" onClick={nextMonth}>›</button>
              </div>
            </div>

            <div className="day-headers">
              {["SUN","MON","TUE","WED","THU","FRI","SAT"].map(d => (
                <div key={d} className="day-header">{d}</div>
              ))}
            </div>

            <div className="weeks-container">
              {crops.length === 0 ? (
                <div style={{ 
                  textAlign: 'center', 
                  padding: '40px', 
                  color: 'var(--muted)',
                  fontStyle: 'italic'
                }}>
                  No crops available. Add crops to see them in your calendar.
                </div>
              ) : (
                weeks.map((w, wi) => {
                  const weekInfo = weekSlices[wi] || { events: [], laneCount: 1 };
                  const events = weekInfo.events || [];
                  const laneCount = weekInfo.laneCount || 1;

                  return (
                    <div key={wi} className="week-row">
                      <div
                        className="week-grid"
                        style={{ gridTemplateColumns: "repeat(7, 1fr)", gridTemplateRows: `repeat(${laneCount}, var(--lane-height))` }}
                      >
                        {w.days.map((d, di) => {
                          const inMonth = d.getMonth() === currentMonth.getMonth();
                          return (
                            <div key={di} className={`day-cell ${inMonth ? "in-month" : "out-month"}`}>
                              <span className="date-number">{d.getDate()}</span>
                            </div>
                          );
                        })}

                        {events.map(ev => (
                          <div
                            key={ev.id}
                            className="cv-event"
                            onClick={() => openModalForCropId(ev.cropId)}
                            title={`${ev.title}\nPlot: ${ev.plot}\nStage: ${ev.growthStage}\nPlanting: ${ev.plantingDate} → Harvest: ${ev.harvestingDate}`}
                            style={{
                              gridColumn: `${ev.startDay + 1} / ${ev.endDay + 2}`,
                              gridRow: `${(ev.lane || 0) + 1} / ${(ev.lane || 0) + 2}`,
                              background: ev.color,
                              cursor: "pointer"
                            }}
                          >
                            <div className="ev-text">
                              <div className="ev-title">{ev.title}</div>
                              <div className="ev-meta">{ev.plot} • {ev.growthStage}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <aside className="calendar-legend">
            <div className="legend-block">
              <div className="legend-title">Legend</div>
              {["Germinating","Vegetative","Flowering","Maturity","Harvesting","Completed"].map((k) => (
                <div key={k} className="legend-item">
                  <span className="legend-dot" style={{ background: colorForStage(k) }} />
                  <span className="legend-label">{k}</span>
                </div>
              ))}
            </div>
            <div className="legend-block" style={{ marginTop: '20px' }}>
              <div className="legend-title">Your Crops</div>
              <div style={{ fontSize: '14px', color: 'var(--muted)' }}>
                Total: {crops.length} crops
              </div>
              {crops.length > 0 && (
                <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '8px' }}>
                  Showing crops for current user
                </div>
              )}
            </div>
          </aside>
        </div>

        {modalOpen && selectedCrop && (
          <div className="cv-modal" role="dialog" aria-modal="true" onClick={closeModal}>
            <div className="cv-modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="cv-modal-header">
                <h3>{selectedCrop.cropLabel || selectedCrop.cropName}</h3>
                <button className="modal-close" onClick={closeModal}>✕</button>
              </div>
              <div className="cv-modal-body">
                <p><strong>Crop name:</strong> {selectedCrop.cropName}</p>
                <p><strong>Plot:</strong> {selectedCrop.plot}</p>
                <p><strong>Growth stage:</strong> {selectedCrop.growthStage}</p>
                <p><strong>Health status:</strong> {selectedCrop.healthStatus}</p>
                <p><strong>Planting date:</strong> {selectedCrop.plantingDate}</p>
                <p><strong>Expected harvest:</strong> {selectedCrop.harvestingDate}</p>
                {selectedCrop.expectedYield !== undefined && <p><strong>Expected yield:</strong> {selectedCrop.expectedYield} kg</p>}
              </div>
              <div className="cv-modal-footer">
                <button className="modal-btn" onClick={closeModal}>Close</button>
              </div>
            </div>
          </div>
        )}

        <ToastContainer position="top-right" autoClose={1800} />
      </div>
      <Footer />
    </>
  );
}