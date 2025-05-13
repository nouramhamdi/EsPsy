import React, { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import AppointmentService from '../../../../Services/AppointmentService';
import Card from '../../../components/card';
import { FiArrowLeft, FiUser, FiBook, FiActivity, FiClock, FiEdit, FiPlus, FiRefreshCw } from 'react-icons/fi';
import { FiCopy, FiDownload } from 'react-icons/fi';
import jsPDF from 'jspdf';

const StudentProfilePage = () => {
  const { studentId, idfile } = useParams();
  const location = useLocation();
  const [studentData, setStudentData] = useState(null);
  const [fileData, setfileData] = useState();
  const [analysis, setAnalysis] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const loggedUser = JSON.parse(localStorage.getItem("loggedUser")) || {};

  // États pour la modification des notes
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [editedNote, setEditedNote] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateNote = async (noteId) => {
    try {
      setIsUpdating(true);
      const response = await AppointmentService.updateFileNote(idfile, noteId, {
        note: editedNote
      });
      
      setfileData(prev => ({
        ...prev,
        notes: prev.notes.map(note => 
          note._id === noteId ? { ...note, note: editedNote } : note
        )
      }));
      
      setEditingNoteId(null);
      setEditedNote('');
    } catch (error) {
      console.error('Error updating note:', error);
      // Vous pouvez ajouter un toast ou un message d'erreur ici
    } finally {
      setIsUpdating(false);
    }
  };

  const exportToPDF = () => {
    setIsGeneratingPDF(true);
    const doc = new jsPDF();
  
    // Configuration
    const margin = 15;
    const maxWidth = 180;
    let yPosition = 20;
    const lineHeight = 6;
    const sectionGap = 15;
    const minCardHeight = 40; // Hauteur minimale pour une carte
  
    // Couleurs modernes
    const primaryColor = '#2c4964';
    const secondaryColor = '#4a6fa5';
    const accentColor = '#4F46E5';
    const lightBg = '#F8FAFC';
    const borderColor = '#E5E7EB';
    const textColor = '#333333';
    const lightText = '#6B7280';
    const cardBg = '#FFFFFF';
    const cardShadow = '#00000010';
  
    // En-tête amélioré
    doc.setFillColor(primaryColor);
    doc.rect(0, 0, doc.internal.pageSize.width, 50, 'F');
  
    doc.setFontSize(20);
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.text('EsPsy', margin, 35);
  
    doc.setFontSize(14);
    doc.text('Clinical Report', doc.internal.pageSize.width / 2, 35, { align: 'center' });
  
    // Informations patient - design plus moderne
    doc.setFillColor(cardBg);
    doc.roundedRect(margin, 55, maxWidth, 30, 3, 3, 'F');
    doc.setDrawColor(borderColor);
    doc.roundedRect(margin, 55, maxWidth, 30, 3, 3, 'S');
  
    doc.setFontSize(10);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('PATIENT INFORMATION', margin + 8, 64);
  
    doc.setFontSize(9);
    doc.setTextColor(textColor);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${fileData.user?.fullname || 'Not specified'}`, margin + 8, 72);
    doc.text(`Psychologist: ${loggedUser?.fullname || 'Not specified'}`, maxWidth + margin - 8, 72, { align: 'right' });
  
    yPosition = 90;
  
    // Métadonnées avec icônes visuelles
    doc.setFontSize(8);
    doc.setTextColor(lightText);
    doc.text(` Report ID: ${fileData._id?.slice(-8)?.toUpperCase() || ''}`, margin, yPosition);
    doc.text(` Generated: ${new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, maxWidth + margin, yPosition, { align: 'right' });
  
    yPosition += 10;
  
    // Diviseur stylisé
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.8);
    doc.line(margin, yPosition, maxWidth + margin, yPosition);
    yPosition += sectionGap;
  
    // Section Analyse avec meilleure gestion de l'espace
    if (analysis?.analysis) {
      doc.setFontSize(12);
      doc.setTextColor(primaryColor);
      doc.setFont('helvetica', 'bold');
      doc.text('CLINICAL ANALYSIS', margin, yPosition);
      doc.setFillColor(primaryColor);
      doc.rect(margin, yPosition + 3, 50, 1, 'F');
  
      yPosition += 10;
  
      const analysisLines = doc.splitTextToSize(analysis.analysis, maxWidth - 10);
      doc.setFontSize(10);
      doc.setTextColor(textColor);
      doc.setFont('helvetica', 'normal');
      doc.text(analysisLines, margin + 5, yPosition);
      yPosition += (analysisLines.length * lineHeight) + sectionGap;
    }
  
    // Section Recommandations avec cartes adaptatives
    doc.setFontSize(12);
    doc.setTextColor(primaryColor);
    doc.setFont('helvetica', 'bold');
    doc.text('TREATMENT RECOMMENDATIONS', margin, yPosition);
    doc.setFillColor(primaryColor);
    doc.rect(margin, yPosition + 3, 70, 1, 'F');
  
    yPosition += 15; // Plus d'espace avant les cartes
  
    if (fileData?.recommendations?.length > 0) {
      doc.setFontSize(10);
  
      fileData.recommendations.forEach((rec, index) => {
        // Préparation du contenu
        const title = `${index + 1}. ${rec.recommendation.replace('AI Analysis: ', '').split(':')[0]}`;
        const details = rec.recommendation.includes(':')
          ? rec.recommendation.split(':').slice(1).join(':').trim()
          : '';
  
        const contentWidth = maxWidth - 30; // Largeur disponible pour le texte
        const titleLines = doc.splitTextToSize(title, contentWidth);
        const detailLines = details ? doc.splitTextToSize(details, contentWidth) : [];
        
        // Calcul des hauteurs
        const titleHeight = titleLines.length * lineHeight;
        const detailsHeight = detailLines.length * lineHeight;
        const badgesHeight = 10; // Réduit pour gagner de l'espace
        
        // Padding dynamique
        const padding = { 
          top: 10, 
          bottom: 10, 
          left: 15,
          right: 15
        };
        
        // Hauteur totale calculée dynamiquement
        let cardHeight = titleHeight + detailsHeight + badgesHeight + padding.top + padding.bottom;
        cardHeight = Math.max(cardHeight, minCardHeight); // Garantit une hauteur minimale
  
        // Vérification de la place sur la page
        if (yPosition + cardHeight > doc.internal.pageSize.height - 30) {
          doc.addPage();
          yPosition = 20;
          // Répéter l'en-tête de section sur les nouvelles pages
          doc.setFontSize(12);
          doc.setTextColor(primaryColor);
          doc.setFont('helvetica', 'bold');
          doc.text('TREATMENT RECOMMENDATIONS (continued)', margin, yPosition);
          yPosition += 15;
        }
  
        // Carte avec ombre légère (simulée)
        doc.setFillColor(cardBg);
        doc.roundedRect(margin, yPosition, maxWidth, cardHeight, 5, 5, 'F');
        doc.setDrawColor(borderColor);
        doc.roundedRect(margin, yPosition, maxWidth, cardHeight, 5, 5, 'S');
  
        // Badge numéro avec style amélioré
        doc.setFillColor(primaryColor);
        doc.circle(margin + 12, yPosition + 15, 7, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text((index + 1).toString(), margin + 12, yPosition + 18, { align: 'center' });
  
        // Titre avec style
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(primaryColor);
        doc.text(titleLines, margin + 25, yPosition + padding.top);
  
        // Détails avec marge et style
        if (details) {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(textColor);
          doc.text(
            detailLines,
            margin + 25,
            yPosition + padding.top + titleHeight + 3
          );
        }
  
        // Badges en bas de carte - alignement amélioré
        const badgesY = yPosition + cardHeight - padding.bottom;
        
      
  
        
  
        // Réinitialisation pour la prochaine carte
        doc.setFontSize(10);
        yPosition += cardHeight + 10; // Espacement entre les cartes
      });
    }
  
    // Pied de page amélioré
    const footerY = doc.internal.pageSize.height - 20;
    doc.setDrawColor(primaryColor);
    doc.setLineWidth(0.5);
    doc.line(margin, footerY, maxWidth + margin, footerY);
    
    doc.setFontSize(8);
    doc.setTextColor(lightText);
    doc.text(`Confidential document - ${new Date().getFullYear()} © EsPsy Psychological Center`, margin, footerY + 5);
    
    // Numéro de page centré
    doc.text(`Page ${doc.internal.getNumberOfPages()} of ${doc.internal.getNumberOfPages()}`, 
             doc.internal.pageSize.width / 2, footerY + 5, { align: 'center' });
  
    // Filigrane plus discret
    doc.setFontSize(40);
    doc.setTextColor(245, 245, 245);
    doc.setFont('helvetica', 'bold');
    doc.text('CONFIDENTIAL', doc.internal.pageSize.width / 2, doc.internal.pageSize.height / 2, {
      angle: 45,
      align: 'center',
      opacity: 0.5
    });
  
    // Enregistrement avec nom de fichier amélioré
    const fileName = `Clinical_Report_${fileData.user?.fullname?.replace(/ /g, '_') || 'Unknown'}_${new Date().toISOString().slice(0, 10)}.pdf`;
    doc.save(fileName);
    setIsGeneratingPDF(false);
};
  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const student = await AppointmentService.getStudentProfile(studentId);
        const file = await AppointmentService.getFileById(idfile);

        setfileData(file.data);
        setStudentData({
          student: student.student,
          psychologist: student.psychologist,
          updatedAt: student.updatedAt,
          createdAt: student.createdAt,
        });

        if (file.data?.analysis) {
          const rawAnalysis = file.data.analysis;
          const formattedAnalysis = {
            analysis: rawAnalysis.split("**Analysis:**")[1]?.split("**Recommendations:**")[0]?.trim(),
            recommendations: rawAnalysis.split("**Recommendations:**")[1]
              ?.split("\n")
              .filter(line => line.trim().startsWith("-"))
              .map(rec => rec.replace("-", "").trim()),
          };
          setAnalysis(formattedAnalysis);
        }

      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [studentId, idfile]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="animate-spin rounded-full h-14 w-14 border-t-4 border-b-4 border-primary-500"></div>
        <p className="mt-4 text-gray-500">Loading student profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card extra="max-w-md p-6 bg-red-50 border border-red-100">
          <h3 className="text-red-600 font-semibold text-lg flex items-center">
            <FiActivity className="mr-2" />
            Loading error
          </h3>
          <p className="text-red-500 mt-2">{error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Link 
          to="/admin/FilePatientsManagement" 
          className="inline-flex items-center text-primary-600 hover:text-primary-800 transition-colors group"
        >
          <FiArrowLeft className="mr-2 transform group-hover:-translate-x-1 transition-transform" />
          <span className="border-b border-dashed border-primary-600 group-hover:border-solid">
            Back to list
          </span>
        </Link>
      </div>

      <Card extra="rounded-xl border border-gray-100 shadow-xs hover:shadow-sm transition-shadow duration-200 overflow-hidden">
        <div className="p-6 bg-gradient-to-r from-primary-50 to-primary-100 border-b border-primary-200">
          <div className="flex items-start space-x-4">
            <div className="p-3 bg-white rounded-lg shadow-xs">
              <FiUser className="text-2xl text-primary-600" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold text-gray-700">
                {fileData?.user?.fullname}
              </h1>
              <div className="flex flex-wrap items-center mt-2 space-x-3 text-sm text-gray-600">
                <div className="flex items-center bg-white px-2 py-1 rounded-full shadow-xs">
                  <FiClock className="mr-1.5 text-primary-500" />
                  <span>
                    Created on {new Date(fileData?.createdAt).toLocaleDateString('en-US')}
                  </span>
                </div>
                <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium flex items-center">
                  <FiUser className="mr-1" />
                  <span>{loggedUser?.fullname || 'Not assigned'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg shadow-xs">
                  <FiBook className="text-lg text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700">Clinical Notes</h2>
              </div>
            </div>
            
            <Card extra="p-0 bg-white border border-gray-100 overflow-hidden">
              <div className="max-h-96 overflow-y-auto px-5 py-4 custom-scrollbar">
                {Array.isArray(fileData?.notes) && fileData.notes.length > 0 ? (
                  <div className="space-y-4">
                    {fileData.notes.map((noteItem, index) => (
                      <div 
                        key={index} 
                        className="border-l-4 border-primary-300 pl-4 py-3 bg-gradient-to-r from-blue-50 to-white hover:from-blue-100 transition-colors"
                      >
                        {editingNoteId === noteItem._id ? (
                          <div className="space-y-3">
                            <textarea
                              className="w-full p-2 border border-gray-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
                              value={editedNote}
                              onChange={(e) => setEditedNote(e.target.value)}
                              rows={3}
                            />
                            <div className="flex justify-end space-x-2">
                              <button
                                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
                                onClick={() => {
                                  setEditingNoteId(null);
                                  setEditedNote('');
                                }}
                              >
                                Cancel
                              </button>
                              <button
                                className="px-3 py-1 text-sm bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
                                onClick={() => handleUpdateNote(noteItem._id)}
                                disabled={isUpdating || !editedNote.trim()}
                              >
                                {isUpdating ? 'Saving...' : 'Save'}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex justify-between items-start">
                            <p className="text-gray-700">{noteItem.note}</p>
                            <button 
                              className="text-gray-400 hover:text-primary-600 ml-2"
                              onClick={() => {
                                setEditingNoteId(noteItem._id);
                                setEditedNote(noteItem.note);
                              }}
                            >
                              <FiEdit size={16} />
                            </button>
                          </div>
                        )}
                        <div className="mt-2 flex items-center text-xs text-gray-400">
                          <FiClock className="mr-1" />
                          <span>
                            Added on {new Date(noteItem.date).toLocaleDateString('en-US', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FiBook className="mx-auto text-3xl text-gray-300 mb-2" />
                    <p className="text-gray-400 italic">No notes available</p>
                    <button className="mt-3 text-sm text-primary-600 hover:text-primary-800 flex items-center justify-center mx-auto">
                      <FiPlus className="mr-1" />
                      Add your first note
                    </button>
                  </div>
                )}
              </div>
              
              {studentData?.updatedAt && (
                <div className="px-5 py-3 border-t border-gray-100 bg-gray-50">
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    <FiClock className="flex-shrink-0" />
                    <span>
                      Updated on{' '}
                      {new Date(studentData.updatedAt).toLocaleDateString('en-US', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
              )}
            </Card>
          </section>

          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-100 rounded-lg shadow-xs">
                  <FiActivity className="text-lg text-purple-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-700">AI Analysis</h2>
              </div>
            </div>

            {fileData?.recommendations?.length > 0 ? (
              <div className="flex flex-col gap-8 w-full">
                {/* Analysis Section - Matching PDF format */}
                {analysis?.analysis && (
                  <Card extra="p-0 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden w-full">
                    <div className="p-4 border-b border-gray-200 bg-blue-50 flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FiActivity className="text-blue-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Clinical Analysis</h3>
                    </div>
                    <div className="h-[400px] overflow-y-auto px-6 py-4 custom-scrollbar bg-white">
                      {/* Analysis Section */}
                      <div className="mb-6">
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                          Analysis
                        </h4>
                        <div className="pl-4">
                          {analysis.analysis.split("**Analysis:**")[1]?.split("**Recommendations:**")[0]?.trim()
                            .split('\n').map((paragraph, i) => (
                              paragraph.trim() && (
                                <p key={`analysis-${i}`} className="text-gray-700 mb-3">
                                  {paragraph}
                                </p>
                              )
                          ))}
                        </div>
                      </div>

                      {/* Recommendations Section */}
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-2 flex items-center">
                          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                          Recommendations
                        </h4>
                        <ul className="pl-4 list-disc list-inside space-y-2">
                          {analysis.analysis.split("**Recommendations:**")[1]
                            ?.split('\n')
                            .filter(line => line.trim().startsWith("-"))
                            .map((rec, i) => (
                              <li key={`rec-${i}`} className="text-gray-700">
                                {rec.replace("-", "").trim()}
                              </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                    <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex justify-between items-center">
                      <div className="flex items-center text-sm text-gray-500">
                        <FiClock className="mr-2" />
                        <span>Generated on {new Date().toLocaleDateString('en-US')}</span>
                      </div>
                      <button 
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                        onClick={() => navigator.clipboard.writeText(analysis.analysis)}
                      >
                        <FiCopy className="mr-1" size={14} />
                        Copy analysis
                      </button>
                    </div>
                  </Card>
                )}

                {/* Action Plan Section */}
                <Card extra="p-0 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden w-full">
                  <div className="p-4 border-b border-gray-200 bg-purple-50 flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <FiBook className="text-purple-600" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800">Action Plan</h3>
                    </div>
                    <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-1 rounded-full">
                      {fileData.recommendations.length} actions
                    </span>
                  </div>
                  
                  <div className="h-[400px] overflow-y-auto px-4 py-4 custom-scrollbar bg-gray-50">
                    <div className="grid gap-4">
                      {fileData.recommendations.map((rec, index) => (
                        <div 
                          key={index}
                          className="bg-white p-4 rounded-lg border border-gray-200 hover:border-purple-300 transition-colors shadow-xs"
                        >
                          <div className="flex items-start gap-4">
                            <div className="flex-shrink-0 flex items-center justify-center h-8 w-8 rounded-full bg-purple-50 border border-purple-200 text-purple-700 font-medium">
                              {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium text-gray-800 mb-2">
                                {rec.recommendation.replace('AI Analysis: ', '').split(':')[0]}
                              </h4>
                              {rec.recommendation.includes(':') && (
                                <p className="text-gray-600 text-sm mt-2 pl-2 border-l-2 border-gray-200">
                                  {rec.recommendation.split(':').slice(1).join(':').trim()}
                                </p>
                              )}
                              <div className="mt-3 flex flex-wrap gap-2">
                                <span className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-medium ${
                                  rec.priority === 'high' 
                                    ? 'bg-red-100 text-red-800 border border-red-200' 
                                    : rec.priority === 'medium' 
                                      ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                                      : 'bg-green-100 text-green-800 border border-green-200'
                                }`}>
                                  Priority: {rec.priority || 'medium'}
                                </span>
                                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
                                  Duration: {rec.duration || 'variable'}
                                </span>
                              </div>
                            </div>
                            <div className="flex flex-col items-center gap-2">
                              <button 
                                className="text-gray-400 hover:text-purple-600 p-1.5 rounded-full hover:bg-purple-50"
                                onClick={() => navigator.clipboard.writeText(rec.recommendation)}
                                title="Copy recommendation"
                              >
                                <FiCopy size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Last updated: {new Date().toLocaleDateString('en-US')}
                    </span>
                    <button 
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none"
                      onClick={exportToPDF}
                      disabled={isGeneratingPDF}
                    >
                      {isGeneratingPDF ? (
                        <>
                          <FiRefreshCw className="animate-spin mr-2" size={16} />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FiDownload className="mr-2" size={16} />
                          Export report
                        </>
                      )}
                    </button>
                  </div>
                </Card>
              </div>
            ) : (
              <Card extra="p-0 bg-yellow-50 border border-dashed border-yellow-200 w-full h-[500px] flex items-center justify-center">
                <div className="text-center p-8">
                  <FiActivity className="inline-block text-3xl text-yellow-500 mb-2" />
                  <p className="text-yellow-700 font-medium mb-4">
                    No analysis generated
                  </p>
                  <button className="text-sm text-white bg-yellow-500 hover:bg-yellow-600 px-4 py-2 rounded-full flex items-center justify-center mx-auto transition-colors">
                    <FiPlus className="mr-2" />
                    Generate analysis
                  </button>
                </div>
              </Card>
            )}
          </section>
        </div>
      </Card>
      
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a1a1a1;
        }
      `}</style>
    </div>
  );
};

export default StudentProfilePage;