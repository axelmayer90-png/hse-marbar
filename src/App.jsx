import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { 
  ShieldCheck, CheckCircle2, AlertTriangle, 
  PlusCircle, Truck, Calendar, Settings, ClipboardList, 
  Trash2, HardHat, Layers, Edit2, Archive, BarChart3, X, LogOut, User, Lock,
  BookOpen, FileDown, Plus, AlertOctagon, Car, BarChart2, Filter, MessageSquare, CheckSquare, Users
} from 'lucide-react';

export default function App() {
  // Autenticación
  const [session, setSession] = useState(null);
  const [currentUserProfile, setCurrentUserProfile] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authFullName, setAuthFullName] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);

  // Navegación
  const [activeTab, setActiveTab] = useState('operaciones');

  // Datos de campo
  const [rigs, setRigs] = useState([]);
  const [selectedRig, setSelectedRig] = useState('ALL');
  const [currentLocation, setCurrentLocation] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState('Pendientes');

  // Período de Guardia (14x14)
  const [shiftStart, setShiftStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 13);
    return d.toISOString().split('T')[0];
  });
  const [shiftEnd, setShiftEnd] = useState(new Date().toISOString().split('T')[0]);

  // Diario de Actividades
  const [dailyLogs, setDailyLogs] = useState([]);
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logRigId, setLogRigId] = useState('');
  const [logActivityType, setLogActivityType] = useState('Tarea Planificada');
  const [logActivities, setLogActivities] = useState('');
  const [logPending, setLogPending] = useState('');
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingLogId, setEditingLogId] = useState(null);

  // Eventos y Contingencias
  const [incidents, setIncidents] = useState([]);
  const [incDate, setIncDate] = useState(new Date().toISOString().split('T')[0]);
  const [incRigId, setIncRigId] = useState('');
  const [incType, setIncType] = useState('Incidente ambiental (derrame)');
  const [incDesc, setIncDesc] = useState('');
  const [incAction, setIncAction] = useState('');
  const [showIncModal, setShowIncModal] = useState(false);
  const [editingIncId, setEditingIncId] = useState(null);

  // Bienes / Recursos
  const [assets, setAssets] = useState([]);
  const [newAssetName, setNewAssetName] = useState('');
  const [newAssetCond, setNewAssetCond] = useState('Bueno / Operativo');
  const [newAssetNotes, setNewAssetNotes] = useState('');
  const [showAssetModal, setShowAssetModal] = useState(false);

  // Histórico
  const [pastLocations, setPastLocations] = useState([]);
  const [selectedHistoryLoc, setSelectedHistoryLoc] = useState('');
  const [historyTasks, setHistoryTasks] = useState([]);

  // Modales operativos
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveRigId, setMoveRigId] = useState('');
  const [newLocName, setNewLocName] = useState('');
  const [newLocDate, setNewLocDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTplIds, setSelectedTplIds] = useState([]);

  // Modal Tarea Eventual / Difusión
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskDate, setTaskDate] = useState(new Date().toISOString().split('T')[0]);
  const [taskIsPersistent, setTaskIsPersistent] = useState(false);

  // Modal de Gestión/Cierre de Tareas
  const [selectedTaskForEdit, setSelectedTaskForEdit] = useState(null);
  const [editStatus, setEditStatus] = useState('En Progreso');
  const [editComments, setEditComments] = useState('');
  const [editClosedDate, setEditClosedDate] = useState(new Date().toISOString().split('T')[0]);
  const [editClosedByName, setEditClosedByName] = useState('');
  const [isSavingTaskModal, setIsSavingTaskModal] = useState(false);

  // Modal Registro de Turno en Difusión
  const [shiftTask, setShiftTask] = useState(null);
  const [shiftName, setShiftName] = useState('Turno Mañana / Turno 1');
  const [shiftParticipants, setShiftParticipants] = useState('');
  const [shiftDate, setShiftDate] = useState(new Date().toISOString().split('T')[0]);

  // Difusión Masiva desde Panel Admin
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastDesc, setBroadcastDesc] = useState('');
  const [broadcastDate, setBroadcastDate] = useState(new Date().toISOString().split('T')[0]);
  const [broadcastSelectedRigs, setBroadcastSelectedRigs] = useState([]);
  const [broadcastLoading, setBroadcastLoading] = useState(false);

  // Modal para Asignar Tarea del Catálogo a Equipos Existentes
  const [assignTplModal, setAssignTplModal] = useState(null);
  const [assignSelectedRigs, setAssignSelectedRigs] = useState([]);
  const [assignDate, setAssignDate] = useState(new Date().toISOString().split('T')[0]);
  const [assignLoading, setAssignLoading] = useState(false);

  // Admin Plantillas y Equipos
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [tplTitle, setTplTitle] = useState('');
  const [tplDesc, setTplDesc] = useState('');
  const [tplStage, setTplStage] = useState('1ra Quincena (Día 0 a 15)');
  const [tplDays, setTplDays] = useState(0);
  const [newRigName, setNewRigName] = useState('');

  // Estados de Auditoría (Admin)
  const [adminSelectedInspector, setAdminSelectedInspector] = useState('ALL');
  const [adminDateFrom, setAdminDateFrom] = useState('');
  const [adminDateTo, setAdminDateTo] = useState('');

  const activityTypes = [
    'Asistencia a DTM',
    'Tarea Planificada',
    'Simulacro',
    'Reunión',
    'Visita general',
    'Inspección / Auditoría',
    'Inducción / Capacitación',
    'Difusión Temática',
    'Otro'
  ];

  const incidentTypes = [
    'Incidente ambiental (derrame)',
    'Accidente vehicular',
    'Accidente In Itinere',
    'Accidente personal',
    'Incidente de alto potencial'
  ];

  const stageOptions = [
    { label: 'Montaje e Inicio (Día 0 a 5)', defaultDays: 0 },
    { label: '1ra Quincena (Día 0 a 15)', defaultDays: 7 },
    { label: 'Mes 1 (Día 16 a 30)', defaultDays: 25 },
    { label: 'Mes 2 (Día 31 a 60)', defaultDays: 45 },
    { label: 'Mes 3 / Finalización (Día 61 a 90)', defaultDays: 75 }
  ];

  // 1. SESIÓN
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
        loadProfiles();
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        loadUserProfile(session.user.id);
        loadProfiles();
      } else {
        setCurrentUserProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId) => {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).single();
    if (data) setCurrentUserProfile(data);
  };

  const loadProfiles = async () => {
    const { data } = await supabase.from('profiles').select('*').order('full_name');
    setProfiles(data || []);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: authEmail,
      password: authPassword
    });
    if (error) alert('Error al iniciar sesión: ' + error.message);
    setAuthLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    const { error } = await supabase.auth.signUp({
      email: authEmail,
      password: authPassword,
      options: {
        data: {
          full_name: authFullName || authEmail.split('@')[0],
          role: 'inspector'
        }
      }
    });
    if (error) alert('Error: ' + error.message);
    else alert('Usuario registrado con éxito.');
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // 2. CARGA DE DATOS GENERALES
  const loadRigs = async () => {
    const { data } = await supabase.from('rigs').select('*').order('name');
    setRigs(data || []);
    if (data && data.length > 0) {
      if (!logRigId) setLogRigId(data[0].id);
      if (!incRigId) setIncRigId(data[0].id);
    }
  };

  const loadTemplates = async () => {
    const { data } = await supabase.from('task_templates').select('*').order('days_offset', { ascending: true });
    setTemplates(data || []);
    setSelectedTplIds((data || []).map(t => t.id));
  };

  const loadDailyLogs = async () => {
    if (!session) return;
    const { data } = await supabase.from('daily_logs').select('*').order('log_date', { ascending: false });
    setDailyLogs(data || []);
  };

  const loadIncidents = async () => {
    if (!session) return;
    const { data } = await supabase.from('incidents_events').select('*').order('event_date', { ascending: false });
    setIncidents(data || []);
  };

  const loadAssets = async () => {
    if (!session) return;
    const { data } = await supabase.from('handoff_assets').select('*').order('asset_name');
    setAssets(data || []);
  };

  useEffect(() => {
    if (session) {
      loadRigs();
      loadTemplates();
      loadDailyLogs();
      loadIncidents();
      loadAssets();
    }
  }, [session]);

  const loadTasks = async () => {
    if (!session) return;
    setLoading(true);

    if (selectedRig === 'ALL') {
      const { data } = await supabase
        .from('tasks')
        .select(`
          *,
          rig_locations (
            id,
            location_name,
            is_current,
            rigs ( id, name )
          ),
          rigs ( id, name )
        `)
        .order('scheduled_date', { ascending: true });

      setCurrentLocation(null);
      const filtered = (data || []).filter(t => t.rig_locations?.is_current || (t.is_persistent && t.status !== 'Completada'));
      setTasks(filtered);
    } else {
      const { data: locData } = await supabase
        .from('rig_locations')
        .select('id, location_name, start_date')
        .eq('rig_id', selectedRig)
        .eq('is_current', true)
        .maybeSingle();

      setCurrentLocation(locData || null);

      let query = supabase
        .from('tasks')
        .select(`
          *,
          rig_locations (
            id,
            location_name,
            rigs ( id, name )
          ),
          rigs ( id, name )
        `);

      if (locData) {
        query = query.or(`rig_location_id.eq.${locData.id},and(rig_id.eq.${selectedRig},is_persistent.eq.true)`);
      } else {
        query = query.eq('rig_id', selectedRig).eq('is_persistent', true);
      }

      const { data: taskData } = await query.order('scheduled_date', { ascending: true });
      setTasks(taskData || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (session) loadTasks();
  }, [selectedRig, session]);

  // 3. DIARIO DE ACTIVIDADES
  const openNewLogModal = () => {
    setEditingLogId(null);
    setLogDate(new Date().toISOString().split('T')[0]);
    setLogRigId(rigs[0]?.id || '');
    setLogActivityType('Tarea Planificada');
    setLogActivities('');
    setLogPending('');
    setShowLogModal(true);
  };

  const openEditLogModal = (log) => {
    setEditingLogId(log.id);
    setLogDate(log.log_date);
    setLogRigId(log.rig_id);
    setLogActivityType(log.activity_type);
    setLogActivities(log.activities);
    setLogPending(log.pending_notes || '');
    setShowLogModal(true);
  };

  const handleSaveDailyLog = async (e) => {
    e.preventDefault();
    if (!logActivities.trim() || !logRigId) return;

    const chosenRig = rigs.find(r => r.id === logRigId);
    const rigName = chosenRig ? chosenRig.name : 'Equipo de Campo';
    const inspectorName = currentUserProfile?.full_name || session.user.email;

    if (editingLogId) {
      const { error } = await supabase.from('daily_logs').update({
        log_date: logDate,
        rig_id: logRigId,
        rig_name: rigName,
        activity_type: logActivityType,
        activities: logActivities.trim(),
        pending_notes: logPending.trim()
      }).eq('id', editingLogId);

      if (error) alert('Error al actualizar: ' + error.message);
      else {
        setShowLogModal(false);
        setEditingLogId(null);
        loadDailyLogs();
      }
    } else {
      const { error } = await supabase.from('daily_logs').insert({
        user_id: session.user.id,
        user_name: inspectorName,
        log_date: logDate,
        rig_id: logRigId,
        rig_name: rigName,
        activity_type: logActivityType,
        activities: logActivities.trim(),
        pending_notes: logPending.trim()
      });

      if (error) alert('Error al guardar: ' + error.message);
      else {
        setShowLogModal(false);
        loadDailyLogs();
      }
    }
  };

  const handleDeleteDailyLog = async (id) => {
    if (!confirm('¿Eliminar registro de actividad?')) return;
    await supabase.from('daily_logs').delete().eq('id', id);
    loadDailyLogs();
  };

  // 4. EVENTOS Y CONTINGENCIAS
  const openNewIncModal = () => {
    setEditingIncId(null);
    setIncDate(new Date().toISOString().split('T')[0]);
    setIncRigId(rigs[0]?.id || '');
    setIncType('Incidente ambiental (derrame)');
    setIncDesc('');
    setIncAction('');
    setShowIncModal(true);
  };

  const openEditIncModal = (inc) => {
    setEditingIncId(inc.id);
    setIncDate(inc.event_date);
    setIncRigId(inc.rig_id);
    setIncType(inc.event_type);
    setIncDesc(inc.description);
    setIncAction(inc.immediate_action || '');
    setShowIncModal(true);
  };

  const handleSaveIncident = async (e) => {
    e.preventDefault();
    if (!incDesc.trim() || !incRigId) return;

    const chosenRig = rigs.find(r => r.id === incRigId);
    const rigName = chosenRig ? chosenRig.name : 'Equipo de Campo';

    if (editingIncId) {
      const { error } = await supabase.from('incidents_events').update({
        event_date: incDate,
        rig_id: incRigId,
        rig_name: rigName,
        event_type: incType,
        description: incDesc.trim(),
        immediate_action: incAction.trim()
      }).eq('id', editingIncId);

      if (error) alert('Error al actualizar: ' + error.message);
      else {
        setShowIncModal(false);
        setEditingIncId(null);
        loadIncidents();
      }
    } else {
      const { error } = await supabase.from('incidents_events').insert({
        user_id: session.user.id,
        event_date: incDate,
        rig_id: incRigId,
        rig_name: rigName,
        event_type: incType,
        description: incDesc.trim(),
        immediate_action: incAction.trim()
      });

      if (error) alert('Error: ' + error.message);
      else {
        setShowIncModal(false);
        loadIncidents();
      }
    }
  };

  const handleDeleteIncident = async (id) => {
    if (!confirm('¿Eliminar contingencia?')) return;
    await supabase.from('incidents_events').delete().eq('id', id);
    loadIncidents();
  };

  // 5. BIENES Y RECURSOS
  const handleSaveAsset = async (e) => {
    e.preventDefault();
    if (!newAssetName.trim()) return;

    const { error } = await supabase.from('handoff_assets').insert({
      user_id: session.user.id,
      asset_name: newAssetName.trim(),
      condition_status: newAssetCond,
      notes: newAssetNotes.trim(),
      is_delivered: true
    });

    if (error) alert('Error: ' + error.message);
    else {
      setNewAssetName('');
      setNewAssetNotes('');
      setShowAssetModal(false);
      loadAssets();
    }
  };

  const handleToggleAssetDelivered = async (asset) => {
    const updatedStatus = !asset.is_delivered;
    await supabase.from('handoff_assets').update({
      is_delivered: updatedStatus,
      updated_at: new Date().toISOString()
    }).eq('id', asset.id);
    loadAssets();
  };

  const handleUpdateAssetStatus = async (id, status, notes) => {
    await supabase.from('handoff_assets').update({
      condition_status: status,
      notes: notes,
      updated_at: new Date().toISOString()
    }).eq('id', id);
    loadAssets();
  };

  const handleDeleteAsset = async (id) => {
    if (!confirm('¿Eliminar elemento?')) return;
    await supabase.from('handoff_assets').delete().eq('id', id);
    loadAssets();
  };

  // 6. GENERACIÓN DE PDF MARBAR S.A.
  const getBase64ImageFromUrl = (imageUrl) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'Anonymous';
      const timer = setTimeout(() => resolve(null), 800);
      img.onload = () => {
        clearTimeout(timer);
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          resolve(canvas.toDataURL('image/png'));
        } catch {
          resolve(null);
        }
      };
      img.onerror = () => {
        clearTimeout(timer);
        resolve(null);
      };
      img.src = imageUrl;
    });
  };

  const handleExportPDF = async () => {
    try {
      const doc = new jsPDF();
      const inspectorName = currentUserProfile?.full_name || session?.user?.email || 'Inspector HSE';

      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, 210, 36, 'F');

      const logoBase64 = await getBase64ImageFromUrl('/logo.png');
      if (logoBase64) {
        try {
          doc.addImage(logoBase64, 'PNG', 12, 6, 42, 22);
        } catch {
          doc.setFontSize(14);
          doc.setTextColor(132, 204, 22);
          doc.text('MARBAR S.A.', 14, 18);
        }
      } else {
        doc.setFontSize(14);
        doc.setTextColor(132, 204, 22);
        doc.text('MARBAR S.A.', 14, 18);
      }

      doc.setFontSize(12);
      doc.setTextColor(255, 255, 255);
      doc.text('INFORME DE RELEVO Y CAMBIO DE GUARDIA', 60, 14);

      doc.setFontSize(8.5);
      doc.setTextColor(203, 213, 225);
      doc.text(`Razón Social: MARBAR S.A. | Emisión: ${new Date().toLocaleDateString('es-AR')}`, 60, 20);
      doc.text(`Inspector Saliente: ${inspectorName}`, 60, 25);
      doc.text(`Período de Diagrama (14x14): Desde ${shiftStart} hasta ${shiftEnd}`, 60, 30);

      let currentY = 44;

      // TABLA 1: ACTIVIDADES
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('1. ACTIVIDADES DIARIAS Y GESTIÓN EN CAMPO', 14, currentY);
      currentY += 3;

      const tableDataLogs = dailyLogs.map((log) => [
        log.log_date || '',
        log.rig_name || '',
        log.activity_type || 'Tarea Planificada',
        log.activities || '',
        log.pending_notes || 'Sin pendientes'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Fecha', 'Equipo', 'Tipo de Actividad', 'Detalle / Hallazgos', 'Novedades Relevo']],
        body: tableDataLogs.length > 0 ? tableDataLogs : [['-', '-', '-', 'Sin actividades registradas', '-']],
        theme: 'grid',
        headStyles: { fillColor: [101, 163, 13], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 2.5, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 20 },
          1: { cellWidth: 28 },
          2: { cellWidth: 34 },
          3: { cellWidth: 66 },
          4: { cellWidth: 42 }
        }
      });

      currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 30) + 10;
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      // TABLA 2: CONTINGENCIAS
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('2. CONTINGENCIAS, INCIDENTES Y ACCIDENTES', 14, currentY);
      currentY += 3;

      const tableDataInc = incidents.map((inc) => [
        inc.event_date || '',
        inc.rig_name || '',
        inc.event_type || '',
        `${inc.description} ${inc.immediate_action ? `\n[Medida Inmediata: ${inc.immediate_action}]` : ''}`
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Fecha', 'Equipo', 'Clasificación del Evento', 'Descripción y Medidas Adoptadas']],
        body: tableDataInc.length > 0 ? tableDataInc : [['-', '-', 'Sin novedades', 'No se registraron contingencias ni incidentes en el turno']],
        theme: 'grid',
        headStyles: { fillColor: [217, 119, 6], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 2.5, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 22 },
          1: { cellWidth: 30 },
          2: { cellWidth: 46 },
          3: { cellWidth: 92 }
        }
      });

      currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 30) + 10;
      if (currentY > 230) {
        doc.addPage();
        currentY = 20;
      }

      // TABLA 3: ENTREGA DE BIENES (Solo los entregados)
      doc.setFontSize(10);
      doc.setTextColor(15, 23, 42);
      doc.setFont('helvetica', 'bold');
      doc.text('3. ACTA DE ENTREGA DE BIENES Y RECURSOS ENTREGADOS (MARBAR S.A.)', 14, currentY);
      currentY += 3;

      const deliveredAssets = assets.filter(a => a.is_delivered !== false);
      const tableDataAssets = deliveredAssets.map((a) => [
        a.asset_name,
        a.condition_status,
        a.notes || 'En condiciones normales'
      ]);

      autoTable(doc, {
        startY: currentY,
        head: [['Elemento / Recurso Entregado', 'Estado de Conservación', 'Observaciones / Kilometraje / Accesorios']],
        body: tableDataAssets.length > 0 ? tableDataAssets : [['-', '-', 'Sin elementos entregados']],
        theme: 'grid',
        headStyles: { fillColor: [71, 85, 105], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 2.5, overflow: 'linebreak' },
        columnStyles: {
          0: { cellWidth: 50 },
          1: { cellWidth: 45 },
          2: { cellWidth: 95 }
        }
      });

      currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 30) + 20;
      if (currentY > 250) {
        doc.addPage();
        currentY = 30;
      }

      // FIRMAS
      doc.setFontSize(8.5);
      doc.setTextColor(71, 85, 105);
      doc.setFont('helvetica', 'normal');

      doc.text('____________________________________', 25, currentY);
      doc.text('Firma Inspector Saliente (Entrega)', 32, currentY + 5);
      doc.text(`MARBAR S.A. - ${inspectorName}`, 32, currentY + 9);

      doc.text('____________________________________', 125, currentY);
      doc.text('Firma Inspector Entrante (Recepción)', 132, currentY + 5);
      doc.text('MARBAR S.A. - Guardia Entrante', 135, currentY + 9);

      doc.save(`Relevo_MARBAR_SA_${shiftStart}_al_${shiftEnd}.pdf`);
    } catch (err) {
      console.error(err);
      alert('Error al generar PDF: ' + err.message);
    }
  };

  const isAdmin = currentUserProfile?.role === 'admin' || session?.user?.email === 'axel.mayer90@gmail.com';

  // Modal Gestión y Cierre de Tarea
  const openTaskEditModal = (task) => {
    setSelectedTaskForEdit(task);
    setEditStatus(task.status || 'En Progreso');
    setEditComments(task.comments || '');
    setEditClosedDate(task.closed_work_date || task.completed_date || new Date().toISOString().split('T')[0]);
    setEditClosedByName(task.completed_by_name || currentUserProfile?.full_name || session?.user?.email || '');
  };

  const handleSaveTaskStatusAndDetails = async (e) => {
    e.preventDefault();
    if (!selectedTaskForEdit) return;

    setIsSavingTaskModal(true);
    const isDone = editStatus === 'Completada';
    const nowIso = new Date().toISOString();

    const payload = {
      status: editStatus,
      comments: editComments.trim() || null,
      completed_date: isDone ? editClosedDate : null,
      closed_work_date: isDone ? editClosedDate : null,
      closed_system_date: isDone ? (selectedTaskForEdit.closed_system_date || nowIso) : null,
      completed_by: isDone ? (selectedTaskForEdit.completed_by || session.user.id) : null,
      completed_by_name: isDone 
        ? (isAdmin && editClosedByName.trim() ? editClosedByName.trim() : (currentUserProfile?.full_name || session.user.email)) 
        : null
    };

    const { error } = await supabase
      .from('tasks')
      .update(payload)
      .eq('id', selectedTaskForEdit.id);

    if (error) {
      alert('Error al actualizar la tarea: ' + error.message);
    } else {
      setTasks(tasks.map(t => t.id === selectedTaskForEdit.id ? { ...t, ...payload } : t));
      setSelectedTaskForEdit(null);
    }
    setIsSavingTaskModal(false);
  };

  // Registro de Asistencia por Turnos para Difusiones
  const openShiftModal = (task) => {
    setShiftTask(task);
    setShiftName('Turno Mañana / Turno 1');
    setShiftParticipants('');
    setShiftDate(new Date().toISOString().split('T')[0]);
  };

  const handleSaveShiftEntry = async (e) => {
    e.preventDefault();
    if (!shiftTask || !shiftParticipants.trim()) return;

    const currentShifts = Array.isArray(shiftTask.shifts_data) ? shiftTask.shifts_data : [];
    const newEntry = {
      id: Date.now().toString(),
      shift_name: shiftName,
      date: shiftDate,
      trainer_name: currentUserProfile?.full_name || session.user.email,
      participants: shiftParticipants.trim()
    };

    const updatedShifts = [...currentShifts, newEntry];

    const { error } = await supabase.from('tasks').update({
      shifts_data: updatedShifts
    }).eq('id', shiftTask.id);

    if (error) {
      alert('Error al guardar registro de difusión: ' + error.message);
    } else {
      setTasks(tasks.map(t => t.id === shiftTask.id ? { ...t, shifts_data: updatedShifts } : t));
      setShiftTask(null);
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!confirm('¿Deseas eliminar esta tarea?')) return;
    await supabase.from('tasks').delete().eq('id', taskId);
    setTasks(tasks.filter(t => t.id !== taskId));
  };

  // Mover Equipo con Selección de Tareas
  const handleOpenMoveModal = () => {
    setMoveRigId(selectedRig === 'ALL' ? rigs[0]?.id : selectedRig);
    setSelectedTplIds(templates.map(t => t.id));
    setNewLocName('');
    setNewLocDate(new Date().toISOString().split('T')[0]);
    setShowMoveModal(true);
  };

  const toggleTemplateSelection = (id) => {
    if (selectedTplIds.includes(id)) {
      setSelectedTplIds(selectedTplIds.filter(x => x !== id));
    } else {
      setSelectedTplIds([...selectedTplIds, id]);
    }
  };

  const handleMoveRigWithSelectedTemplates = async (e) => {
    e.preventDefault();
    const targetRigId = selectedRig === 'ALL' ? moveRigId : selectedRig;
    if (!targetRigId || !newLocName.trim()) return;

    setLoading(true);

    // 1. Cerrar locación anterior
    await supabase
      .from('rig_locations')
      .update({ is_current: false, end_date: newLocDate })
      .eq('rig_id', targetRigId)
      .eq('is_current', true);

    // 2. Crear nueva locación activa
    const { data: newLoc, error: locError } = await supabase
      .from('rig_locations')
      .insert({
        rig_id: targetRigId,
        location_name: newLocName.trim(),
        start_date: newLocDate,
        is_current: true
      })
      .select()
      .single();

    if (locError) {
      alert('Error al crear locación: ' + locError.message);
      setLoading(false);
      return;
    }

    // 3. Crear las tareas seleccionadas
    const chosenTemplates = templates.filter(t => selectedTplIds.includes(t.id));
    if (chosenTemplates.length > 0) {
      const spud = new Date(newLocDate);
      const newTasks = chosenTemplates.map(tpl => {
        const scheduled = new Date(spud);
        scheduled.setDate(scheduled.getDate() + (tpl.days_offset || 0));
        return {
          rig_location_id: newLoc.id,
          title: tpl.title,
          description: tpl.description || '',
          scheduled_date: scheduled.toISOString().split('T')[0],
          status: 'Pendiente'
        };
      });

      await supabase.from('tasks').insert(newTasks);
    }

    setShowMoveModal(false);
    loadTasks();
  };

  // Crear Tarea Eventual o Difusión Persistente desde Operaciones
  const handleCreateExtraTask = async (e) => {
    e.preventDefault();
    const targetRig = selectedRig === 'ALL' ? rigs[0]?.id : selectedRig;
    if (!targetRig || !taskTitle.trim()) return;

    const payload = {
      title: taskTitle.trim(),
      description: taskDesc.trim(),
      scheduled_date: taskDate,
      status: 'Pendiente',
      is_persistent: taskIsPersistent,
      rig_id: targetRig,
      rig_location_id: currentLocation?.id || null
    };

    const { error } = await supabase.from('tasks').insert(payload);
    if (error) {
      alert('Error al crear la tarea: ' + error.message);
    } else {
      setTaskTitle('');
      setTaskDesc('');
      setTaskIsPersistent(false);
      setShowTaskModal(false);
      loadTasks();
    }
  };

  // Lanzar Difusión Masiva desde Panel Admin (guarda en plantillas y asigna)
  const handleCreateBroadcastTask = async (e) => {
    e.preventDefault();
    if (!broadcastTitle.trim()) {
      alert('Ingresa el título de la difusión.');
      return;
    }

    setBroadcastLoading(true);

    try {
      // 1. Guardar la difusión en task_templates (Catálogo Maestro)
      const { error: tplError } = await supabase.from('task_templates').insert({
        title: broadcastTitle.trim(),
        description: broadcastDesc.trim() || 'Campaña / Difusión Temática',
        stage: 'Difusión / Campaña Especial',
        days_offset: 0
      });

      if (tplError) throw tplError;

      // 2. Si se seleccionaron equipos, asignarla de inmediato
      if (broadcastSelectedRigs.length > 0) {
        const { data: activeLocs } = await supabase
          .from('rig_locations')
          .select('id, rig_id')
          .in('rig_id', broadcastSelectedRigs)
          .eq('is_current', true);

        const locMap = {};
        (activeLocs || []).forEach(loc => {
          locMap[loc.rig_id] = loc.id;
        });

        const tasksToInsert = broadcastSelectedRigs.map(rigId => ({
          rig_id: rigId,
          rig_location_id: locMap[rigId] || null,
          title: broadcastTitle.trim(),
          description: broadcastDesc.trim(),
          scheduled_date: broadcastDate,
          status: 'Pendiente',
          is_persistent: true,
          shifts_data: []
        }));

        const { error: taskError } = await supabase.from('tasks').insert(tasksToInsert);
        if (taskError) throw taskError;
      }

      alert('¡Difusión guardada en el Catálogo Maestro y asignada a los equipos seleccionados!');
      setBroadcastTitle('');
      setBroadcastDesc('');
      setBroadcastSelectedRigs([]);
      loadTemplates();
      loadTasks();
    } catch (err) {
      console.error(err);
      alert('Error al guardar y asignar difusión: ' + err.message);
    } finally {
      setBroadcastLoading(false);
    }
  };

  const toggleBroadcastRig = (rigId) => {
    if (broadcastSelectedRigs.includes(rigId)) {
      setBroadcastSelectedRigs(broadcastSelectedRigs.filter(id => id !== rigId));
    } else {
      setBroadcastSelectedRigs([...broadcastSelectedRigs, rigId]);
    }
  };

  const toggleAllBroadcastRigs = () => {
    if (broadcastSelectedRigs.length === rigs.length) {
      setBroadcastSelectedRigs([]);
    } else {
      setBroadcastSelectedRigs(rigs.map(r => r.id));
    }
  };

  // ASIGNAR CUALQUIER TAREA DEL CATÁLOGO A EQUIPOS ACTIVOS
  const handleAssignTemplateToRigs = async (e) => {
    e.preventDefault();
    if (!assignTplModal || assignSelectedRigs.length === 0) {
      alert('Selecciona al menos un equipo para asignar la tarea.');
      return;
    }

    setAssignLoading(true);

    try {
      const { data: activeLocs, error: locError } = await supabase
        .from('rig_locations')
        .select('id, rig_id')
        .in('rig_id', assignSelectedRigs)
        .eq('is_current', true);

      if (locError) throw locError;

      const locMap = {};
      (activeLocs || []).forEach(loc => {
        locMap[loc.rig_id] = loc.id;
      });

      const tasksToInsert = assignSelectedRigs.map(rigId => ({
        rig_id: rigId,
        rig_location_id: locMap[rigId] || null,
        title: assignTplModal.title,
        description: assignTplModal.description || '',
        scheduled_date: assignDate,
        status: 'Pendiente',
        is_persistent: false
      }));

      const { error: insertError } = await supabase.from('tasks').insert(tasksToInsert);
      if (insertError) throw insertError;

      alert(`¡Tarea asignada con éxito a ${assignSelectedRigs.length} equipo(s)!`);
      setAssignTplModal(null);
      setAssignSelectedRigs([]);
      loadTasks();
    } catch (err) {
      console.error(err);
      alert('Error al asignar la tarea a los equipos: ' + err.message);
    } finally {
      setAssignLoading(false);
    }
  };

  const toggleAssignRig = (rigId) => {
    if (assignSelectedRigs.includes(rigId)) {
      setAssignSelectedRigs(assignSelectedRigs.filter(id => id !== rigId));
    } else {
      setAssignSelectedRigs([...assignSelectedRigs, rigId]);
    }
  };

  const toggleAllAssignRigs = () => {
    if (assignSelectedRigs.length === rigs.length) {
      setAssignSelectedRigs([]);
    } else {
      setAssignSelectedRigs(rigs.map(r => r.id));
    }
  };

  // Histórico
  const loadPastLocations = async () => {
    const { data } = await supabase
      .from('rig_locations')
      .select('*, rigs(name)')
      .eq('is_current', false)
      .order('end_date', { ascending: false });

    setPastLocations(data || []);
    if (data && data.length > 0 && !selectedHistoryLoc) {
      setSelectedHistoryLoc(data[0].id);
    }
  };

  useEffect(() => {
    if (activeTab === 'historico' && session) loadPastLocations();
  }, [activeTab, session]);

  useEffect(() => {
    if (!selectedHistoryLoc) {
      setHistoryTasks([]);
      return;
    }
    async function loadPastTasks() {
      const { data } = await supabase.from('tasks').select('*').eq('rig_location_id', selectedHistoryLoc).order('scheduled_date', { ascending: true });
      setHistoryTasks(data || []);
    }
    loadPastTasks();
  }, [selectedHistoryLoc]);

  const handleDeleteHistoricLocation = async () => {
    if (!selectedHistoryLoc || !isAdmin) return;
    if (!confirm('¿Estás seguro de eliminar este pozo archivado del historial? Se borrarán también sus registros asociados.')) return;

    await supabase.from('tasks').delete().eq('rig_location_id', selectedHistoryLoc);
    await supabase.from('rig_locations').delete().eq('id', selectedHistoryLoc);
    
    setSelectedHistoryLoc('');
    loadPastLocations();
  };

  // Admin Plantillas
  const handleSaveTemplate = async (e) => {
    e.preventDefault();
    if (!tplTitle.trim()) return;

    if (editingTemplateId) {
      await supabase.from('task_templates').update({
        title: tplTitle.trim(),
        description: tplDesc.trim(),
        stage: tplStage,
        days_offset: parseInt(tplDays, 10) || 0
      }).eq('id', editingTemplateId);
    } else {
      await supabase.from('task_templates').insert({
        title: tplTitle.trim(),
        description: tplDesc.trim(),
        stage: tplStage,
        days_offset: parseInt(tplDays, 10) || 0
      });
    }
    setEditingTemplateId(null);
    setTplTitle('');
    setTplDesc('');
    loadTemplates();
  };

  const startEditTemplate = (tpl) => {
    setEditingTemplateId(tpl.id);
    setTplTitle(tpl.title);
    setTplDesc(tpl.description || '');
    setTplStage(tpl.stage || '1ra Quincena (Día 0 a 15)');
    setTplDays(tpl.days_offset || 0);
  };

  const handleDeleteTemplate = async (id) => {
    if (!confirm('¿Eliminar tarea de plantilla?')) return;
    await supabase.from('task_templates').delete().eq('id', id);
    loadTemplates();
  };

  const handleCreateRig = async (e) => {
    e.preventDefault();
    if (!newRigName.trim()) return;
    await supabase.from('rigs').insert({ name: newRigName.trim() });
    setNewRigName('');
    loadRigs();
  };

  const handleDeleteRig = async (rigId, rigName) => {
    if (!confirm(`¿Eliminar el "${rigName}"?`)) return;
    await supabase.from('rigs').delete().eq('id', rigId);
    loadRigs();
    if (selectedRig === rigId) setSelectedRig('ALL');
  };

  // Métricas y Cálculos
  const activeRigsCount = new Set(tasks.map(t => t.rig_locations?.rigs?.id || t.rigs?.id).filter(Boolean)).size || rigs.length;

  const dtmCount = new Set(dailyLogs.filter(l => l.activity_type === 'Asistencia a DTM').map(l => l.log_date)).size;
  const drillCount = dailyLogs.filter(l => l.activity_type === 'Simulacro').length;
  const plannedCount = dailyLogs.filter(l => l.activity_type === 'Tarea Planificada').length;
  const meetingCount = dailyLogs.filter(l => l.activity_type === 'Reunión').length;

  const filteredAdminLogs = dailyLogs.filter((log) => {
    if (adminSelectedInspector !== 'ALL' && log.user_id !== adminSelectedInspector) return false;
    if (adminDateFrom && log.log_date < adminDateFrom) return false;
    if (adminDateTo && log.log_date > adminDateTo) return false;
    return true;
  });

  const groupedDaysMap = {};
  filteredAdminLogs.forEach((log) => {
    const dayKey = `${log.log_date}_${log.user_id}`;
    if (!groupedDaysMap[dayKey]) {
      groupedDaysMap[dayKey] = {
        date: log.log_date,
        userId: log.user_id,
        userName: log.user_name,
        activitiesList: []
      };
    }
    groupedDaysMap[dayKey].activitiesList.push(log);
  });

  const groupedDaysArray = Object.values(groupedDaysMap).sort((a, b) => new Date(b.date) - new Date(a.date));

  const uniqueDtmDays = new Set(
    filteredAdminLogs
      .filter(l => l.activity_type === 'Asistencia a DTM')
      .map(l => `${l.log_date}_${l.user_id}`)
  ).size;

  const adminStats = {
    totalWorkDays: groupedDaysArray.length,
    dtmDays: uniqueDtmDays,
    simulacro: filteredAdminLogs.filter(l => l.activity_type === 'Simulacro').length,
    plan: filteredAdminLogs.filter(l => l.activity_type === 'Tarea Planificada').length,
    reunion: filteredAdminLogs.filter(l => l.activity_type === 'Reunión').length,
    visita: filteredAdminLogs.filter(l => l.activity_type === 'Visita general').length,
    auditoria: filteredAdminLogs.filter(l => l.activity_type === 'Inspección / Auditoría').length,
    capacitacion: filteredAdminLogs.filter(l => l.activity_type === 'Inducción / Capacitación').length,
    totalActivities: filteredAdminLogs.length
  };

  const today = new Date().toISOString().split('T')[0];
  const isOverdue = (scheduledDate, status) => status !== 'Completada' && scheduledDate < today;
  const isDueToday = (scheduledDate, status) => status !== 'Completada' && scheduledDate === today;

  const totalTasksCount = tasks.length;
  const completedTasksCount = tasks.filter(t => t.status === 'Completada').length;
  const pendingTasksCount = tasks.filter(t => t.status !== 'Completada').length;
  const overdueTasksCount = tasks.filter(t => isOverdue(t.scheduled_date, t.status)).length;
  const complianceRate = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const filteredTasks = tasks.filter(t => {
    if (filterStatus === 'Pendientes') return t.status !== 'Completada';
    if (filterStatus === 'Completadas') return t.status === 'Completada';
    return true;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (a.status === 'Completada' && b.status !== 'Completada') return 1;
    if (a.status !== 'Completada' && b.status === 'Completada') return -1;
    return new Date(a.scheduled_date) - new Date(b.scheduled_date);
  });

  // Login
  if (!session) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-2xl shadow-xl space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex p-3 bg-amber-100 rounded-full text-amber-600 mb-1">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h1 className="text-xl font-bold text-slate-900">MARBAR S.A.</h1>
            <p className="text-xs text-slate-500">Control HSE y Operaciones en Perforación</p>
          </div>

          <form onSubmit={isRegistering ? handleRegister : handleLogin} className="space-y-4">
            {isRegistering && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre Completo:</label>
                <input
                  type="text"
                  placeholder="Ej: Juan Pérez"
                  value={authFullName}
                  onChange={(e) => setAuthFullName(e.target.value)}
                  required
                  className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Correo Electrónico:</label>
              <input
                type="email"
                placeholder="usuario@marbar.com.ar"
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                required
                className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">Contraseña:</label>
              <input
                type="password"
                placeholder="••••••••"
                value={authPassword}
                onChange={(e) => setAuthPassword(e.target.value)}
                required
                className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 rounded-lg text-sm transition disabled:opacity-50"
            >
              {authLoading ? 'Verificando...' : isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <button
              onClick={() => setIsRegistering(!isRegistering)}
              className="text-xs text-slate-600 hover:text-amber-600 font-semibold"
            >
              {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿Nuevo usuario? Regístrate aquí'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // App Principal
  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 pb-20">
      <header className="bg-slate-900 text-white p-4 shadow-md sticky top-0 z-20">
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-amber-500" />
            <div>
              <h1 className="text-base font-bold leading-tight">MARBAR S.A. | HSE Perforación</h1>
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span className="flex items-center gap-1 text-slate-300 font-medium">
                  <User className="w-3 h-3 text-amber-400" />
                  {currentUserProfile?.full_name || session.user.email}
                </span>
                <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold uppercase ${
                  isAdmin ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'bg-slate-700 text-slate-300'
                }`}>
                  {currentUserProfile?.role || 'Inspector'}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex flex-wrap bg-slate-800 p-1 rounded-lg text-xs font-semibold gap-1">
              <button
                onClick={() => setActiveTab('operaciones')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition ${
                  activeTab === 'operaciones' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <ClipboardList className="w-3.5 h-3.5" />
                Operaciones
              </button>
              <button
                onClick={() => setActiveTab('guardia')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition ${
                  activeTab === 'guardia' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                Diario (14x14)
              </button>
              <button
                onClick={() => setActiveTab('contingencias')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition ${
                  activeTab === 'contingencias' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5 text-red-400" />
                Contingencias
              </button>
              <button
                onClick={() => setActiveTab('elementos')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition ${
                  activeTab === 'elementos' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Car className="w-3.5 h-3.5 text-blue-400" />
                Bienes
              </button>
              <button
                onClick={() => setActiveTab('historico')}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition ${
                  activeTab === 'historico' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Archive className="w-3.5 h-3.5" />
                Histórico
              </button>
              {isAdmin && (
                <button
                  onClick={() => setActiveTab('admin')}
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-md transition ${
                    activeTab === 'admin' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <Settings className="w-3.5 h-3.5" />
                  Admin
                </button>
              )}
            </div>

            <button
              onClick={handleLogout}
              className="p-1.5 bg-slate-800 hover:bg-red-600 text-slate-400 hover:text-white rounded-lg transition"
              title="Cerrar Sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 space-y-4">
        {/* OPERACIONES */}
        {activeTab === 'operaciones' && (
          <>
            <section className="grid grid-cols-2 sm:grid-cols-6 gap-2">
              <div className="bg-slate-900 text-white p-3 rounded-xl shadow-sm col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">Equipos Activos</span>
                <span className="text-xl font-black">{activeRigsCount}</span>
                <span className="text-[10px] text-slate-400 block">en operación</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Planificadas</span>
                <span className="text-xl font-black text-slate-800">{totalTasksCount}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Pendientes</span>
                <span className="text-xl font-black text-blue-700">{pendingTasksCount}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-red-600 uppercase tracking-wider block">Vencidas</span>
                <span className="text-xl font-black text-red-600">{overdueTasksCount}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Completadas</span>
                <span className="text-xl font-black text-emerald-700">{completedTasksCount}</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Cumplimiento</span>
                <div className="flex items-center gap-1">
                  <span className="text-xl font-black text-slate-800">{complianceRate}%</span>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${complianceRate}%` }}></div>
                  </div>
                </div>
              </div>
            </section>

            <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5" />
                  Filtrar por Equipo
                </label>
                {isAdmin && rigs.length > 0 && (
                  <button
                    onClick={handleOpenMoveModal}
                    className="flex items-center gap-1 text-xs bg-amber-600 hover:bg-amber-700 text-white font-semibold py-1.5 px-3 rounded-lg transition"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Mover Equipo (Nuevo Pozo)
                  </button>
                )}
              </div>

              <select
                value={selectedRig}
                onChange={(e) => setSelectedRig(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 text-base font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
              >
                <option value="ALL">🌐 Ver Todos los Equipos (Consolidado)</option>
                {rigs.map((rig) => (
                  <option key={rig.id} value={rig.id}>📍 {rig.name}</option>
                ))}
              </select>

              {selectedRig !== 'ALL' && currentLocation && (
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex justify-between items-center text-xs">
                  <div>
                    <span className="text-slate-500">Pozo actual:</span>{' '}
                    <strong className="text-slate-800 text-sm">{currentLocation.location_name}</strong>
                  </div>
                  <span className="text-slate-500">Spud-in: {currentLocation.start_date}</span>
                </div>
              )}
            </section>

            <section className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1 bg-slate-200 p-1 rounded-lg text-xs font-semibold">
                {['Pendientes', 'Todos', 'Completadas'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilterStatus(f)}
                    className={`px-3 py-1.5 rounded-md transition ${
                      filterStatus === f ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setShowTaskModal(true)}
                className="flex items-center gap-1 text-xs bg-slate-800 hover:bg-slate-700 text-white font-semibold py-1.5 px-3 rounded-lg transition ml-auto"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                + Tarea Eventual / Difusión
              </button>
            </section>

            {/* MODAL MOVER EQUIPO */}
            {showMoveModal && (
              <form onSubmit={handleMoveRigWithSelectedTemplates} className="bg-white p-5 rounded-xl shadow-2xl border-2 border-amber-500 space-y-4 max-h-[85vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b pb-2">
                  <h3 className="text-sm font-bold text-slate-800">Registrar Traslado a Nuevo Pozo y Seleccionar Tareas</h3>
                  <button type="button" onClick={() => setShowMoveModal(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Equipo que se traslada:</label>
                    <select
                      value={moveRigId}
                      onChange={(e) => setMoveRigId(e.target.value)}
                      className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {rigs.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Nombre del Pozo / Locación:</label>
                    <input
                      type="text"
                      placeholder="Ej: Pozo Loma Campana LC-205"
                      value={newLocName}
                      onChange={(e) => setNewLocName(e.target.value)}
                      required
                      className="w-full text-sm p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Fecha de Inicio / Spud-in:</label>
                    <input
                      type="date"
                      value={newLocDate}
                      onChange={(e) => setNewLocDate(e.target.value)}
                      required
                      className="w-full text-sm p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="block text-xs font-bold text-slate-700">
                      Actividades del Catálogo Maestro para este pozo ({selectedTplIds.length}/{templates.length}):
                    </label>
                    <button
                      type="button"
                      onClick={() => setSelectedTplIds(selectedTplIds.length === templates.length ? [] : templates.map(t => t.id))}
                      className="text-[11px] text-amber-600 hover:underline font-semibold"
                    >
                      {selectedTplIds.length === templates.length ? 'Desmarcar Todas' : 'Marcar Todas'}
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50/50 p-1">
                    {templates.map((tpl) => {
                      const isSelected = selectedTplIds.includes(tpl.id);
                      return (
                        <label key={tpl.id} className="flex items-center gap-2 p-2 hover:bg-amber-50/40 cursor-pointer text-xs rounded transition">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleTemplateSelection(tpl.id)}
                            className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                          />
                          <div className="flex-1">
                            <span className="font-semibold text-slate-800">{tpl.title}</span>
                            <span className="text-[10px] text-slate-400 block">{tpl.stage} (Día +{tpl.days_offset})</span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  <button type="button" onClick={() => setShowMoveModal(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">
                    Cancelar
                  </button>
                  <button type="submit" disabled={loading} className="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition disabled:opacity-50">
                    {loading ? 'Generando...' : 'Generar Tareas Seleccionadas'}
                  </button>
                </div>
              </form>
            )}

            {/* MODAL TAREA EVENTUAL / DIFUSIÓN PERSISTENTE */}
            {showTaskModal && (
              <form onSubmit={handleCreateExtraTask} className="bg-white p-5 rounded-xl shadow-lg border border-slate-300 space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Agregar Tarea Eventual / Campaña de Difusión</h3>
                <input
                  type="text"
                  placeholder="Título de la tarea o tema de difusión"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  required
                  className="w-full text-sm p-2 border border-slate-300 rounded-lg focus:outline-none"
                />
                <textarea
                  placeholder="Alcance, instrucciones o detalles..."
                  value={taskDesc}
                  onChange={(e) => setTaskDesc(e.target.value)}
                  className="w-full text-sm p-2 border border-slate-300 rounded-lg"
                  rows={2}
                />
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Fecha Programada:</label>
                  <input
                    type="date"
                    value={taskDate}
                    onChange={(e) => setTaskDate(e.target.value)}
                    required
                    className="w-full text-sm p-2 border border-slate-300 rounded-lg"
                  />
                </div>

                <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 flex items-start gap-2">
                  <input
                    type="checkbox"
                    id="isPersistentCheck"
                    checked={taskIsPersistent}
                    onChange={(e) => setTaskIsPersistent(e.target.checked)}
                    className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <label htmlFor="isPersistentCheck" className="text-xs text-amber-900 cursor-pointer">
                    <strong className="block">Difusión Persistente (No retirar al mover el equipo)</strong>
                    La tarea permanecerá activa asociada al equipo hasta que se completen las difusiones de todos los turnos.
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowTaskModal(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg">
                    Guardar Tarea
                  </button>
                </div>
              </form>
            )}

            {/* MODAL GESTIÓN / CIERRE DE TAREA */}
            {selectedTaskForEdit && (
              <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
                  <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base">Gestionar / Actualizar Tarea</h3>
                      <p className="text-xs text-slate-400">MARBAR S.A. - Trazabilidad Operativa</p>
                    </div>
                    <button type="button" onClick={() => setSelectedTaskForEdit(null)} className="text-slate-400 hover:text-white p-1">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveTaskStatusAndDetails} className="p-5 space-y-4 overflow-y-auto">
                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Tarea:</span>
                      <h4 className="text-sm font-bold text-slate-800">{selectedTaskForEdit.title}</h4>
                      {selectedTaskForEdit.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{selectedTaskForEdit.description}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Estado de la Tarea:</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value)}
                        className="w-full text-sm font-semibold p-2.5 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      >
                        <option value="Pendiente">⏳ Pendiente</option>
                        <option value="En Progreso">🔄 En Progreso</option>
                        <option value="Completada">✅ Completada / Cerrada</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Comentarios / Novedad de avance o resolución:
                      </label>
                      <textarea
                        value={editComments}
                        onChange={(e) => setEditComments(e.target.value)}
                        placeholder="Ingresa qué se inspeccionó, hallazgos o cómo se resolvió..."
                        rows={3}
                        required={editStatus === 'Completada'}
                        className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    {editStatus === 'Completada' && (
                      <div className="bg-amber-50/70 p-4 rounded-xl border border-amber-200 space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 border-b border-amber-200/60 pb-2">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Datos de Cierre y Trazabilidad
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Fecha en que se completó el trabajo:
                          </label>
                          <input
                            type="date"
                            value={editClosedDate}
                            onChange={(e) => setEditClosedDate(e.target.value)}
                            required
                            className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-white"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Cerrado por:
                          </label>
                          <input
                            type="text"
                            value={editClosedByName}
                            onChange={(e) => setEditClosedByName(e.target.value)}
                            disabled={!isAdmin}
                            placeholder="Nombre del inspector o responsable..."
                            className={`w-full text-sm p-2 border border-slate-300 rounded-lg ${
                              isAdmin ? 'bg-white text-slate-900' : 'bg-slate-100 text-slate-500 cursor-not-allowed'
                            }`}
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                      <button type="button" onClick={() => setSelectedTaskForEdit(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
                        Cancelar
                      </button>
                      <button type="submit" disabled={isSavingTaskModal} className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg transition disabled:opacity-50">
                        {isSavingTaskModal ? 'Guardando...' : 'Guardar Cambios'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* MODAL REGISTRO DE ASISTENCIA POR TURNO */}
            {shiftTask && (
              <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                    <div>
                      <h3 className="font-bold text-sm sm:text-base">Registrar Difusión por Turno</h3>
                      <p className="text-xs text-slate-400">{shiftTask.title}</p>
                    </div>
                    <button type="button" onClick={() => setShiftTask(null)} className="text-slate-400 hover:text-white">
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSaveShiftEntry} className="p-5 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Turno que participó:</label>
                        <select
                          value={shiftName}
                          onChange={(e) => setShiftName(e.target.value)}
                          className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-white"
                        >
                          <option value="Turno Mañana / Turno 1">Turno Mañana / Turno 1</option>
                          <option value="Turno Tarde / Turno 2">Turno Tarde / Turno 2</option>
                          <option value="Turno Noche / Turno 3">Turno Noche / Turno 3</option>
                          <option value="Personal de Mantenimiento">Personal de Mantenimiento</option>
                          <option value="Compañías Contratistas">Compañías Contratistas</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de Realización:</label>
                        <input
                          type="date"
                          value={shiftDate}
                          onChange={(e) => setShiftDate(e.target.value)}
                          required
                          className="w-full text-sm p-2 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Personal Asistente / Participantes:
                      </label>
                      <textarea
                        value={shiftParticipants}
                        onChange={(e) => setShiftParticipants(e.target.value)}
                        placeholder="Nombres, DNI o puestos de los asistentes en este turno..."
                        rows={4}
                        required
                        className="w-full text-sm p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t">
                      <button type="button" onClick={() => setShiftTask(null)} className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg">
                        Cancelar
                      </button>
                      <button type="submit" className="px-5 py-2 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white rounded-lg">
                        Guardar Asistencia de Turno
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Listado Tareas */}
            <section className="space-y-2.5">
              {loading ? (
                <div className="text-center py-10 text-slate-400 text-sm">Cargando tareas activas...</div>
              ) : sortedTasks.length === 0 ? (
                <div className="bg-white p-8 rounded-xl text-center text-slate-400 text-sm border border-dashed border-slate-300">
                  No hay tareas en esta categoría.
                </div>
              ) : (
                sortedTasks.map((task) => {
                  const overdue = isOverdue(task.scheduled_date, task.status);
                  const dueToday = isDueToday(task.scheduled_date, task.status);
                  const rigName = task.rig_locations?.rigs?.name || task.rigs?.name;
                  const locName = task.rig_locations?.location_name;
                  const isLocked = task.status === 'Completada' && !isAdmin && task.completed_by !== session.user.id;
                  const shiftsList = Array.isArray(task.shifts_data) ? task.shifts_data : [];

                  return (
                    <div 
                      key={task.id} 
                      className={`bg-white p-4 rounded-xl shadow-sm border transition-all ${
                        task.status === 'Completada' ? 'border-emerald-200 bg-emerald-50/20 opacity-90' :
                        task.status === 'En Progreso' ? 'border-blue-300 bg-blue-50/20' :
                        overdue ? 'border-red-400 bg-red-50/40' :
                        dueToday ? 'border-amber-400 bg-amber-50/40' :
                        'border-slate-200'
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2 pb-1.5 border-b border-slate-100 text-xs font-semibold text-slate-600">
                        <div className="flex items-center gap-2">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                            🚜 {rigName || 'Equipo'}
                          </span>
                          {locName && (
                            <>
                              <span className="text-slate-400">|</span>
                              <span className="text-slate-600 truncate max-w-[200px]">📍 {locName}</span>
                            </>
                          )}
                        </div>

                        {task.is_persistent && (
                          <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded-full border border-purple-200">
                            📢 Campaña Persistente (Multilocación)
                          </span>
                        )}
                      </div>

                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold text-slate-900 text-sm">{task.title}</h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                              task.status === 'Completada' ? 'bg-emerald-100 text-emerald-800' :
                              task.status === 'En Progreso' ? 'bg-blue-100 text-blue-800' :
                              overdue ? 'bg-red-100 text-red-800 font-black' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {task.status}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{task.description}</p>
                          )}

                          {/* COMENTARIOS */}
                          {task.comments && (
                            <div className="mt-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-700">
                              <span className="font-bold text-slate-900 flex items-center gap-1 mb-0.5 text-[11px] uppercase tracking-wider">
                                <MessageSquare className="w-3 h-3 text-amber-600" />
                                Comentarios / Hallazgos:
                              </span>
                              <p className="whitespace-pre-line leading-relaxed">{task.comments}</p>
                            </div>
                          )}

                          {/* TURNOS DE DIFUSIÓN REGISTRADOS */}
                          {task.is_persistent && (
                            <div className="mt-2.5 bg-purple-50/60 p-2.5 rounded-lg border border-purple-200 text-xs space-y-1.5">
                              <div className="flex justify-between items-center">
                                <span className="font-bold text-purple-900 flex items-center gap-1 text-[11px] uppercase tracking-wider">
                                  <Users className="w-3.5 h-3.5 text-purple-600" />
                                  Turnos con Difusión Realizada ({shiftsList.length}):
                                </span>
                                <button
                                  type="button"
                                  onClick={() => openShiftModal(task)}
                                  className="text-[11px] font-bold text-purple-700 hover:text-purple-900 bg-white px-2 py-0.5 rounded border border-purple-300 shadow-xs"
                                >
                                  + Registrar Turno
                                </button>
                              </div>

                              {shiftsList.length === 0 ? (
                                <p className="text-[11px] text-purple-600 italic">No se han registrado turnos aún.</p>
                              ) : (
                                <div className="space-y-1 pt-1">
                                  {shiftsList.map((s, sIdx) => (
                                    <div key={sIdx} className="bg-white p-2 rounded border border-purple-100 text-[11px]">
                                      <div className="flex justify-between font-semibold text-slate-800">
                                        <span>👥 {s.shift_name} ({s.date})</span>
                                        <span className="text-slate-500 text-[10px]">Por: {s.trainer_name}</span>
                                      </div>
                                      <p className="text-slate-600 mt-0.5"><strong className="text-slate-700">Participantes:</strong> {s.participants}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {isLocked ? (
                            <div className="flex items-center gap-1 text-xs bg-slate-100 text-slate-500 px-2.5 py-1.5 rounded-lg border border-slate-200 font-medium">
                              <Lock className="w-3.5 h-3.5 text-slate-400" />
                              <span>Cerrada</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => openTaskEditModal(task)}
                              className="flex items-center gap-1 text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg shadow-sm transition"
                            >
                              <Edit2 className="w-3 h-3" />
                              Gestionar / Cerrar
                            </button>
                          )}

                          {isAdmin && (
                            <button onClick={() => handleDeleteTask(task.id)} className="text-slate-300 hover:text-red-500 p-1" title="Eliminar tarea">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-3 mt-2 border-t border-slate-100">
                        <span className={`flex items-center gap-1 font-medium ${
                          overdue ? 'text-red-600 font-bold' :
                          dueToday ? 'text-amber-700 font-bold' :
                          'text-slate-600'
                        }`}>
                          <Calendar className="w-3.5 h-3.5" />
                          Prog: {task.scheduled_date} 
                          {overdue && ' ⚠️ VENCIDA'}
                          {dueToday && ' ⏳ VENCE HOY'}
                        </span>

                        {(task.completed_date || task.closed_work_date) && (
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                            <span className="flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              Cerrada por: <strong>{task.completed_by_name || 'Inspector'}</strong> el {task.closed_work_date || task.completed_date}
                            </span>
                            {task.closed_system_date && (
                              <span className="text-[10px] text-slate-400 font-normal">
                                (Cargado en app: {new Date(task.closed_system_date).toLocaleDateString('es-AR')})
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </section>
          </>
        )}

        {/* DIARIO DE GUARDIA (14x14) */}
        {activeTab === 'guardia' && (
          <div className="space-y-4">
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider block">Días en DTM</span>
                <span className="text-xl font-black text-slate-800">{dtmCount}</span>
                <span className="text-[10px] text-slate-400 block">días con presencia</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider block">Simulacros</span>
                <span className="text-xl font-black text-blue-700">{drillCount}</span>
                <span className="text-[10px] text-slate-400 block">ejecutados</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-wider block">Tareas Planificadas</span>
                <span className="text-xl font-black text-emerald-700">{plannedCount}</span>
                <span className="text-[10px] text-slate-400 block">actividades</span>
              </div>
              <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[11px] font-bold text-purple-600 uppercase tracking-wider block">Reuniones HSE</span>
                <span className="text-xl font-black text-purple-700">{meetingCount}</span>
                <span className="text-[10px] text-slate-400 block">reuniones</span>
              </div>
            </section>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    Diario de Guardia (Diagrama 14x14) - MARBAR S.A.
                  </h2>
                  <p className="text-xs text-slate-500">
                    Carga diaria tipificada para emisión del parte de relevo y análisis estadístico.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={openNewLogModal}
                    className="flex items-center gap-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold py-2 px-3 rounded-lg transition shadow-sm"
                  >
                    <Plus className="w-4 h-4" />
                    + Actividad Diaria
                  </button>
                  <button
                    onClick={handleExportPDF}
                    className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-4 rounded-lg transition shadow-sm"
                  >
                    <FileDown className="w-4 h-4 text-amber-400" />
                    Descargar Relevo MARBAR S.A. (PDF)
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-slate-600">Fecha Ingreso Diagrama:</label>
                  <input
                    type="date"
                    value={shiftStart}
                    onChange={(e) => setShiftStart(e.target.value)}
                    className="border border-slate-300 rounded-lg p-1.5 text-xs bg-slate-50 font-semibold"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="font-semibold text-slate-600">Fecha Egreso Diagrama:</label>
                  <input
                    type="date"
                    value={shiftEnd}
                    onChange={(e) => setShiftEnd(e.target.value)}
                    className="border border-slate-300 rounded-lg p-1.5 text-xs bg-slate-50 font-semibold"
                  />
                </div>
              </div>
            </div>

            {showLogModal && (
              <form onSubmit={handleSaveDailyLog} className="bg-white p-5 rounded-xl shadow-lg border-2 border-amber-500 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800">
                    {editingLogId ? 'Editar Actividad del Diario' : 'Registrar Actividad de Campo'}
                  </h3>
                  <button type="button" onClick={() => setShowLogModal(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha:</label>
                    <input
                      type="date"
                      value={logDate}
                      onChange={(e) => setLogDate(e.target.value)}
                      required
                      className="w-full text-sm p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Equipo Visitado:</label>
                    <select
                      value={logRigId}
                      onChange={(e) => setLogRigId(e.target.value)}
                      required
                      className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {rigs.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Tipo de Actividad:</label>
                    <select
                      value={logActivityType}
                      onChange={(e) => setLogActivityType(e.target.value)}
                      required
                      className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-white font-medium"
                    >
                      {activityTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Detalle de la Actividad y Hallazgos:</label>
                  <textarea
                    placeholder="Detalle específico de lo realizado..."
                    value={logActivities}
                    onChange={(e) => setLogActivities(e.target.value)}
                    required
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Novedades / Pendientes Relevo (Opcional):</label>
                  <textarea
                    placeholder="Observaciones para el relevo..."
                    value={logPending}
                    onChange={(e) => setLogPending(e.target.value)}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowLogModal(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition">
                    {editingLogId ? 'Actualizar Actividad' : 'Guardar en Mi Diario'}
                  </button>
                </div>
              </form>
            )}

            {/* Listado Diario */}
            <div className="space-y-3">
              {dailyLogs.length === 0 ? (
                <div className="bg-white p-8 rounded-xl text-center text-slate-400 text-sm border border-dashed border-slate-300">
                  No hay actividades registradas en el diario aún.
                </div>
              ) : (
                dailyLogs.map((log) => (
                  <div key={log.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
                          📅 {log.log_date}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded">
                          🚜 {log.rig_name}
                        </span>
                        <span className="text-xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded">
                          🏷️ {log.activity_type || 'Tarea Planificada'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-slate-400">Por: <strong>{log.user_name}</strong></span>
                        {(log.user_id === session.user.id || isAdmin) && (
                          <>
                            <button onClick={() => openEditLogModal(log)} className="text-slate-400 hover:text-amber-600 p-1" title="Editar actividad">
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteDailyLog(log.id)} className="text-slate-300 hover:text-red-500 p-1" title="Eliminar actividad">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line pt-1">
                      <strong className="text-slate-900 block text-[11px] uppercase tracking-wider mb-0.5">Actividades:</strong>
                      {log.activities}
                    </div>
                    {log.pending_notes && (
                      <div className="text-xs text-amber-800 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200 mt-2">
                        <strong className="block text-[11px] uppercase tracking-wider text-amber-900 mb-0.5">Pendiente para el Relevo:</strong>
                        {log.pending_notes}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* CONTINGENCIAS */}
        {activeTab === 'contingencias' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <AlertOctagon className="w-4 h-4 text-red-600" />
                  Registro de Contingencias, Incidentes y Accidentes
                </h2>
                <p className="text-xs text-slate-500">
                  Tipificación oficial de contingencias para informe PDF de cambio de guardia.
                </p>
              </div>

              <button
                onClick={openNewIncModal}
                className="flex items-center gap-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3.5 rounded-lg transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                + Reportar Evento / Contingencia
              </button>
            </div>

            {showIncModal && (
              <form onSubmit={handleSaveIncident} className="bg-white p-5 rounded-xl shadow-lg border-2 border-red-500 space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-800">
                    {editingIncId ? 'Editar Contingencia' : 'Cargar Contingencia / Suceso en Campo'}
                  </h3>
                  <button type="button" onClick={() => setShowIncModal(false)} className="text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Fecha del Suceso:</label>
                    <input
                      type="date"
                      value={incDate}
                      onChange={(e) => setIncDate(e.target.value)}
                      required
                      className="w-full text-sm p-2 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Equipo Asociado:</label>
                    <select
                      value={incRigId}
                      onChange={(e) => setIncRigId(e.target.value)}
                      required
                      className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-white"
                    >
                      {rigs.map((r) => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Clasificación:</label>
                    <select
                      value={incType}
                      onChange={(e) => setIncType(e.target.value)}
                      required
                      className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-white font-medium"
                    >
                      {incidentTypes.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Descripción del Suceso:</label>
                  <textarea
                    placeholder="Detalles de lo acontecido..."
                    value={incDesc}
                    onChange={(e) => setIncDesc(e.target.value)}
                    required
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-1 focus:ring-red-500"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Medidas Inmediatas Adoptadas:</label>
                  <textarea
                    placeholder="Acción correctiva implementada..."
                    value={incAction}
                    onChange={(e) => setIncAction(e.target.value)}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg"
                    rows={2}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowIncModal(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-1.5 text-xs bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition">
                    {editingIncId ? 'Actualizar Contingencia' : 'Guardar Contingencia'}
                  </button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {incidents.length === 0 ? (
                <div className="bg-white p-8 rounded-xl text-center text-slate-400 text-sm border border-dashed border-slate-300">
                  No hay contingencias ni incidentes registrados en este período.
                </div>
              ) : (
                incidents.map((inc) => (
                  <div key={inc.id} className="bg-white p-4 rounded-xl shadow-sm border border-red-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded">
                          🚨 {inc.event_type}
                        </span>
                        <span className="text-xs bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded">
                          🚜 {inc.rig_name}
                        </span>
                        <span className="text-xs text-slate-500">📅 {inc.event_date}</span>
                      </div>
                      {(inc.user_id === session.user.id || isAdmin) && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEditIncModal(inc)} className="text-slate-400 hover:text-red-600 p-1" title="Editar evento">
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button onClick={() => handleDeleteIncident(inc.id)} className="text-slate-300 hover:text-red-500 p-1" title="Eliminar evento">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-slate-800 font-medium leading-relaxed">{inc.description}</p>
                    {inc.immediate_action && (
                      <div className="text-xs bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-700">
                        <strong className="text-slate-900">Medida Adoptada:</strong> {inc.immediate_action}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* BIENES Y ELEMENTOS */}
        {activeTab === 'elementos' && (
          <div className="space-y-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                  <Car className="w-4 h-4 text-blue-600" />
                  Acta de Entrega de Bienes y Recursos (MARBAR S.A.)
                </h2>
                <p className="text-xs text-slate-500">
                  Control de estado de camioneta, herramientas y checkbox para marcar cuáles se entregan en mano al relevo.
                </p>
              </div>

              <button
                onClick={() => setShowAssetModal(true)}
                className="flex items-center gap-1.5 text-xs bg-slate-900 hover:bg-slate-800 text-white font-bold py-2 px-3.5 rounded-lg transition shadow-sm"
              >
                <Plus className="w-4 h-4" />
                + Agregar Recurso
              </button>
            </div>

            {showAssetModal && (
              <form onSubmit={handleSaveAsset} className="bg-white p-5 rounded-xl shadow-lg border-2 border-blue-500 space-y-3">
                <h3 className="text-sm font-bold text-slate-800">Cargar Bien / Elemento a Entregar</h3>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Nombre del Elemento:</label>
                  <input
                    type="text"
                    placeholder="Ej: Camioneta Hilux 4x4 (Dominio AE 123 CD)..."
                    value={newAssetName}
                    onChange={(e) => setNewAssetName(e.target.value)}
                    required
                    className="w-full text-sm p-2 border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Estado de Conservación:</label>
                  <select
                    value={newAssetCond}
                    onChange={(e) => setNewAssetCond(e.target.value)}
                    className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Bueno / Operativo">Bueno / Operativo</option>
                    <option value="Regular">Regular</option>
                    <option value="Con Observación / Dañado">Con Observación / Dañado</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Detalles, Kilometraje y Observaciones:</label>
                  <textarea
                    placeholder="Ej: 142.000 km, tanque lleno, matafuego vigente..."
                    value={newAssetNotes}
                    onChange={(e) => setNewAssetNotes(e.target.value)}
                    className="w-full text-sm p-2 border border-slate-300 rounded-lg"
                    rows={2}
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <button type="button" onClick={() => setShowAssetModal(false)} className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg">
                    Cancelar
                  </button>
                  <button type="submit" className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition">
                    Guardar Elemento
                  </button>
                </div>
              </form>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {assets.map((asset) => (
                <div key={asset.id} className={`bg-white p-4 rounded-xl shadow-sm border transition ${asset.is_delivered !== false ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50'}`}>
                  <div className="flex justify-between items-start mb-2">
                    <span className="font-bold text-slate-900 text-sm">{asset.asset_name}</span>
                    <button onClick={() => handleDeleteAsset(asset.id)} className="text-slate-300 hover:text-red-500 p-1">
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-medium text-slate-500">Condición:</label>
                      <select
                        value={asset.condition_status}
                        onChange={(e) => handleUpdateAssetStatus(asset.id, e.target.value, asset.notes)}
                        className={`text-xs font-bold rounded-lg px-2.5 py-1 border focus:outline-none ${
                          asset.condition_status === 'Bueno / Operativo' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                          asset.condition_status === 'Regular' ? 'bg-amber-50 text-amber-700 border-amber-300' :
                          'bg-red-50 text-red-700 border-red-300'
                        }`}
                      >
                        <option value="Bueno / Operativo">Bueno / Operativo</option>
                        <option value="Regular">Regular</option>
                        <option value="Con Observación / Dañado">Con Observación / Dañado</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs font-bold cursor-pointer text-slate-700">
                      <input
                        type="checkbox"
                        checked={asset.is_delivered !== false}
                        onChange={() => handleToggleAssetDelivered(asset)}
                        className="rounded text-blue-600 focus:ring-blue-500"
                      />
                      <span>{asset.is_delivered !== false ? '✅ Se entrega en relevo' : '❌ No se entrega'}</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Observaciones de Entrega:
                    </label>
                    <input
                      type="text"
                      value={asset.notes || ''}
                      onChange={(e) => handleUpdateAssetStatus(asset.id, asset.condition_status, e.target.value)}
                      placeholder="Sin observaciones..."
                      className="w-full text-xs p-2 border border-slate-200 rounded-lg bg-slate-50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* HISTÓRICO */}
        {activeTab === 'historico' && (
          <div className="space-y-4">
            <section className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-amber-600" />
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    Historial de Pozos Cerrados
                  </h2>
                </div>
                {isAdmin && selectedHistoryLoc && (
                  <button
                    onClick={handleDeleteHistoricLocation}
                    className="flex items-center gap-1 text-xs text-red-600 hover:text-white hover:bg-red-600 border border-red-200 py-1 px-2.5 rounded-lg transition"
                    title="Eliminar este pozo y sus tareas archivadas"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Borrar Pozo Histórico
                  </button>
                )}
              </div>

              {pastLocations.length === 0 ? (
                <p className="text-xs text-slate-400 py-6 text-center">
                  No hay locaciones cerradas archivadas aún.
                </p>
              ) : (
                <>
                  <label className="block text-xs font-semibold text-slate-600">Seleccionar Pozo:</label>
                  <select
                    value={selectedHistoryLoc}
                    onChange={(e) => setSelectedHistoryLoc(e.target.value)}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg bg-slate-50 font-semibold"
                  >
                    {pastLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        🚜 {loc.rigs?.name} — 📍 {loc.location_name} ({loc.start_date} a {loc.end_date || 'Cierre'})
                      </option>
                    ))}
                  </select>

                  <div className="divide-y divide-slate-100 pt-3">
                    <h3 className="text-xs font-bold text-slate-600 uppercase mb-2">Detalle de Actividades</h3>
                    {historyTasks.map((t) => (
                      <div key={t.id} className="py-2.5 flex justify-between items-center text-xs">
                        <div>
                          <p className="font-semibold text-slate-800">{t.title}</p>
                          <p className="text-slate-400">
                            Prog: {t.scheduled_date} 
                            {(t.closed_work_date || t.completed_date) && ` | Cerrada: ${t.closed_work_date || t.completed_date}`}
                            {t.completed_by_name && ` | Por: ${t.completed_by_name}`}
                          </p>
                          {t.comments && (
                            <p className="text-slate-600 italic mt-0.5">"{t.comments}"</p>
                          )}
                        </div>
                        <span className={`px-2 py-0.5 rounded font-bold ${
                          t.status === 'Completada' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </section>
          </div>
        )}

        {/* ADMIN */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-6">
            {/* SECCIÓN: CREAR CAMPAÑA DE DIFUSIÓN Y ASIGNAR A EQUIPOS */}
            <section className="bg-white p-5 rounded-xl shadow-sm border border-purple-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-purple-100 pb-2">
                <Users className="w-5 h-5 text-purple-600" />
                <div>
                  <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                    Lanzar Campaña de Difusión Temática (Persistente)
                  </h2>
                  <p className="text-xs text-slate-500">
                    Crea un tema que se guardará en el catálogo y se replicará en los equipos seleccionados hasta cubrir los turnos.
                  </p>
                </div>
              </div>

              <form onSubmit={handleCreateBroadcastTask} className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Tema / Título de la Difusión:
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: Difusión Lección Aprendida - Procedimiento de Izaje y Maniobras"
                    value={broadcastTitle}
                    onChange={(e) => setBroadcastTitle(e.target.value)}
                    required
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Alcance, Objetivos e Instrucciones para los Inspectores:
                  </label>
                  <textarea
                    placeholder="Indicar puntos clave a transmitir en la charla de relevo o inicio de turno..."
                    value={broadcastDesc}
                    onChange={(e) => setBroadcastDesc(e.target.value)}
                    rows={2}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Fecha Límite / Programada:
                    </label>
                    <input
                      type="date"
                      value={broadcastDate}
                      onChange={(e) => setBroadcastDate(e.target.value)}
                      required
                      className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-white"
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Asignar a Equipos ({broadcastSelectedRigs.length}/{rigs.length}):
                      </label>
                      <button
                        type="button"
                        onClick={toggleAllBroadcastRigs}
                        className="text-[11px] text-purple-600 hover:underline font-semibold"
                      >
                        {broadcastSelectedRigs.length === rigs.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                      </button>
                    </div>

                    <div className="max-h-36 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50 p-1.5">
                      {rigs.map((r) => (
                        <label key={r.id} className="flex items-center gap-2 p-1.5 hover:bg-purple-50/50 cursor-pointer text-xs rounded">
                          <input
                            type="checkbox"
                            checked={broadcastSelectedRigs.includes(r.id)}
                            onChange={() => toggleBroadcastRig(r.id)}
                            className="rounded text-purple-600 focus:ring-purple-500"
                          />
                          <span className="font-semibold text-slate-800">🚜 {r.name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={broadcastLoading}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white font-bold py-2.5 rounded-lg text-xs uppercase tracking-wider transition disabled:opacity-50 shadow-sm"
                >
                  {broadcastLoading ? 'Guardando y asignando difusión...' : '📢 Guardar en Catálogo y Asignar Difusión'}
                </button>
              </form>
            </section>

            {/* PANEL DE ANALÍTICA */}
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-amber-600" />
                  <div>
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      Panel de Control y Analítica de Inspectores
                    </h2>
                    <p className="text-xs text-slate-500">
                      Supervisión por jornadas reales trabajadas y desglose de actividades realizadas.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-amber-600" />
                    Filtrar por Inspector:
                  </label>
                  <select
                    value={adminSelectedInspector}
                    onChange={(e) => setAdminSelectedInspector(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white font-semibold"
                  >
                    <option value="ALL">🌐 Todos los Inspectores (Global)</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>{p.full_name} ({p.email})</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Desde Fecha:
                  </label>
                  <input
                    type="date"
                    value={adminDateFrom}
                    onChange={(e) => setAdminDateFrom(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-600 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    Hasta Fecha:
                  </label>
                  <input
                    type="date"
                    value={adminDateTo}
                    onChange={(e) => setAdminDateTo(e.target.value)}
                    className="w-full p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                <div className="bg-slate-900 text-white p-3 rounded-xl col-span-2 sm:col-span-1 shadow-sm">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">Jornadas Reales</span>
                  <span className="text-2xl font-black text-amber-400">{adminStats.totalWorkDays}</span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">días únicos en campo</span>
                </div>

                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Días en DTM</span>
                  <span className="text-2xl font-black text-amber-900">{adminStats.dtmDays}</span>
                  <span className="text-[10px] text-amber-700 block mt-0.5">días con asistencia</span>
                </div>

                <div className="bg-blue-50 p-3 rounded-xl border border-blue-200">
                  <span className="text-[11px] font-bold text-blue-800 uppercase tracking-wider block">Simulacros</span>
                  <span className="text-2xl font-black text-blue-900">{adminStats.simulacro}</span>
                  <span className="text-[10px] text-blue-700 block mt-0.5">ejecutados</span>
                </div>

                <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Planificadas</span>
                  <span className="text-2xl font-black text-emerald-900">{adminStats.plan}</span>
                  <span className="text-[10px] text-emerald-700 block mt-0.5">completadas</span>
                </div>

                <div className="bg-purple-50 p-3 rounded-xl border border-purple-200">
                  <span className="text-[11px] font-bold text-purple-800 uppercase tracking-wider block">Reuniones HSE</span>
                  <span className="text-2xl font-black text-purple-900">{adminStats.reunion}</span>
                  <span className="text-[10px] text-purple-700 block mt-0.5">reuniones</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Visitas Generales</span>
                  <span className="text-2xl font-black text-slate-800">{adminStats.visita}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Auditorías</span>
                  <span className="text-2xl font-black text-slate-800">{adminStats.auditoria}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">Capacitaciones</span>
                  <span className="text-2xl font-black text-slate-800">{adminStats.capacitacion}</span>
                </div>
              </div>

              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Registro Consolidado de Jornadas ({groupedDaysArray.length} días de campo - {adminStats.totalActivities} actividades)
                </h3>

                <div className="space-y-3">
                  {groupedDaysArray.length === 0 ? (
                    <div className="p-8 text-center text-xs text-slate-400 bg-slate-50 border border-dashed border-slate-200 rounded-xl">
                      No hay jornadas registradas para los filtros aplicados.
                    </div>
                  ) : (
                    groupedDaysArray.map((day, idx) => (
                      <div key={idx} className="bg-slate-50/80 p-4 rounded-xl border border-slate-200 shadow-sm space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs bg-slate-900 text-white font-bold px-2.5 py-1 rounded-md">
                              📅 {day.date}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              👤 {day.userName}
                            </span>
                          </div>
                          <span className="text-[11px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded-full border border-amber-200">
                            {day.activitiesList.length} {day.activitiesList.length === 1 ? 'actividad en la jornada' : 'actividades en la jornada'}
                          </span>
                        </div>

                        <div className="space-y-2 pl-1 sm:pl-2">
                          {day.activitiesList.map((act) => (
                            <div key={act.id} className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                  <span className="bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded border border-blue-200">
                                    🏷️ {act.activity_type}
                                  </span>
                                  <span className="bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded">
                                    🚜 {act.rig_name}
                                  </span>
                                </div>
                                <button
                                  onClick={() => handleDeleteDailyLog(act.id)}
                                  className="text-slate-300 hover:text-red-500 p-1"
                                  title="Eliminar esta actividad puntual"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <p className="text-slate-700 leading-relaxed pt-1">
                                {act.activities}
                              </p>

                              {act.pending_notes && (
                                <p className="text-amber-800 bg-amber-50/70 p-1.5 rounded border border-amber-200 text-[11px]">
                                  <strong>Novedad / Pendiente:</strong> {act.pending_notes}
                                </p>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

            {/* GESTIÓN DE EQUIPOS */}
            <section className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                <HardHat className="w-5 h-5 text-amber-600" />
                <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                  Gestión de Equipos de Perforación
                </h2>
              </div>

              <form onSubmit={handleCreateRig} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Nombre del Equipo (ej: Rig 101...)"
                  value={newRigName}
                  onChange={(e) => setNewRigName(e.target.value)}
                  required
                  className="flex-1 text-sm p-2 border border-slate-300 rounded-lg"
                />
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold px-4 py-2 rounded-lg transition"
                >
                  + Agregar Equipo
                </button>
              </form>

              <div className="divide-y divide-slate-100 pt-1">
                {rigs.map((rig) => (
                  <div key={rig.id} className="py-2.5 flex justify-between items-center text-sm">
                    <span className="font-semibold text-slate-700">{rig.name}</span>
                    <button
                      onClick={() => handleDeleteRig(rig.id, rig.name)}
                      className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1 hover:bg-red-50 py-1 px-2 rounded-lg"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Dar de baja
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* CATÁLOGO MAESTRO */}
            <section className="space-y-4">
              <form onSubmit={handleSaveTemplate} className={`bg-white p-5 rounded-xl shadow-sm border ${
                editingTemplateId ? 'border-2 border-amber-500 bg-amber-50/10' : 'border-slate-200'
              } space-y-3`}>
                <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                  <div className="flex items-center gap-2">
                    <ClipboardList className="w-5 h-5 text-amber-600" />
                    <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
                      {editingTemplateId ? '✏️ Modificar Tarea del Catálogo' : 'Nueva Tarea al Catálogo'}
                    </h2>
                  </div>
                  {editingTemplateId && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingTemplateId(null);
                        setTplTitle('');
                        setTplDesc('');
                      }}
                      className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
                    >
                      <X className="w-4 h-4" /> Cancelar
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Título de la actividad:</label>
                  <input
                    type="text"
                    placeholder="Título de la tarea"
                    value={tplTitle}
                    onChange={(e) => setTplTitle(e.target.value)}
                    required
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Alcance:</label>
                  <textarea
                    placeholder="Instrucciones..."
                    value={tplDesc}
                    onChange={(e) => setTplDesc(e.target.value)}
                    className="w-full text-sm p-2.5 border border-slate-300 rounded-lg"
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Etapa:</label>
                    <select
                      value={tplStage}
                      onChange={(e) => {
                        const stage = e.target.value;
                        setTplStage(stage);
                        const opt = stageOptions.find(o => o.label === stage);
                        if (opt && !editingTemplateId) setTplDays(opt.defaultDays);
                      }}
                      className="w-full text-sm p-2.5 border border-slate-300 rounded-lg bg-white"
                    >
                      {stageOptions.map((opt) => (
                        <option key={opt.label} value={opt.label}>{opt.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Días tras Spud-in:</label>
                    <input
                      type="number"
                      min="0"
                      max="180"
                      value={tplDays}
                      onChange={(e) => setTplDays(e.target.value)}
                      className="w-full text-sm p-2.5 border border-slate-300 rounded-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-amber-600 hover:bg-amber-700 text-white font-bold py-2.5 rounded-lg text-sm transition"
                >
                  {editingTemplateId ? 'Actualizar Cambios' : '+ Guardar en Plantilla'}
                </button>
              </form>

              <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 space-y-3">
                <h3 className="text-sm font-bold text-slate-700">Catálogo Maestro ({templates.length})</h3>
                <div className="divide-y divide-slate-100">
                  {templates.map((tpl) => (
                    <div key={tpl.id} className="py-3 flex flex-wrap justify-between items-center gap-3">
                      <div className="flex-1 min-w-[200px]">
                        <h4 className="text-sm font-semibold text-slate-800">{tpl.title}</h4>
                        {tpl.description && <p className="text-xs text-slate-500">{tpl.description}</p>}
                        <div className="flex gap-2 mt-1">
                          <span className="text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                            {tpl.stage}
                          </span>
                          <span className="text-[11px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded font-medium">
                            Día +{tpl.days_offset}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        {/* BOTÓN ASIGNAR A EQUIPOS EN CUALQUIER MOMENTO */}
                        <button
                          type="button"
                          onClick={() => {
                            setAssignTplModal(tpl);
                            setAssignSelectedRigs(rigs.map(r => r.id));
                            setAssignDate(new Date().toISOString().split('T')[0]);
                          }}
                          className="flex items-center gap-1 text-[11px] font-bold bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-300 px-2 py-1 rounded-lg transition shadow-xs mr-1"
                          title="Asignar esta tarea a equipos activos"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          Asignar
                        </button>

                        <button
                          onClick={() => startEditTemplate(tpl)}
                          className="text-slate-400 hover:text-amber-600 p-2 rounded-lg"
                          title="Editar plantilla"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTemplate(tpl.id)}
                          className="text-slate-400 hover:text-red-600 p-2 rounded-lg"
                          title="Eliminar plantilla"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        )}

        {/* MODAL PARA ASIGNAR CUALQUIER TAREA DEL CATÁLOGO A EQUIPOS EXISTENTES */}
        {assignTplModal && (
          <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
              <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-sm">Asignar Tarea a Equipos en Operación</h3>
                  <p className="text-xs text-slate-400 truncate max-w-[280px]">{assignTplModal.title}</p>
                </div>
                <button type="button" onClick={() => setAssignTplModal(null)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAssignTemplateToRigs} className="p-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    Fecha Programada para la Tarea:
                  </label>
                  <input
                    type="date"
                    value={assignDate}
                    onChange={(e) => setAssignDate(e.target.value)}
                    required
                    className="w-full text-sm p-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      Seleccionar Equipos ({assignSelectedRigs.length}/{rigs.length}):
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllAssignRigs}
                      className="text-[11px] text-amber-600 hover:underline font-semibold"
                    >
                      {assignSelectedRigs.length === rigs.length ? 'Desmarcar Todos' : 'Marcar Todos'}
                    </button>
                  </div>

                  <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100 bg-slate-50 p-1.5">
                    {rigs.map((r) => (
                      <label key={r.id} className="flex items-center gap-2 p-2 hover:bg-amber-50/50 cursor-pointer text-xs rounded transition">
                        <input
                          type="checkbox"
                          checked={assignSelectedRigs.includes(r.id)}
                          onChange={() => toggleAssignRig(r.id)}
                          className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                        />
                        <span className="font-semibold text-slate-800">🚜 {r.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setAssignTplModal(null)}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={assignLoading}
                    className="px-4 py-1.5 text-xs bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition disabled:opacity-50"
                  >
                    {assignLoading ? 'Asignando...' : 'Asignar a Equipos'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}