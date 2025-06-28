"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Eye, User, FileText } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api";

interface Exam {
  examenID: string;
  dateExamen: string;
  description?: string;
  estAnalyse: boolean;
  typeExamen: {
    nomType: string;
    categorie: string;
  };
  demandePar: {
    nom: string;
    prenom: string;
    role: string;
  };
  images: any[];
  radiologues: Array<{
    utilisateurID: string;
    nom: string;
    prenom: string;
    email: string;
  }>;
}

export default function PatientExamsPage() {
  const params = useParams();
  const patientID = params?.id as string;
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!patientID) return;
    const fetchExams = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/examens-medicaux/patient/${patientID}`);
        setExams(response.data);
      } catch (error) {
        setExams([]);
      } finally {
        setLoading(false);
      }
    };
    fetchExams();
  }, [patientID]);

  return (
    <div className="max-w-4xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Examens médicaux du patient</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Chargement...</div>
          ) : exams.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun examen trouvé pour ce patient.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {exams.map((exam) => (
                <div
                  key={exam.examenID}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <FileText className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {exam.typeExamen.nomType} ({exam.typeExamen.categorie})
                      </h3>
                      <p className="text-sm text-gray-500">Demandé par : {exam.demandePar.prenom} {exam.demandePar.nom}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <Calendar className="h-3 w-3 text-gray-400" />
                        <span className="text-xs text-gray-500">
                          {new Date(exam.dateExamen).toLocaleDateString()}
                        </span>
                        <Badge variant={exam.estAnalyse ? "default" : "outline"} className={exam.estAnalyse ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                          {exam.estAnalyse ? "Analysé" : "En attente"}
                        </Badge>
                        <span className="text-xs text-gray-500">{exam.images.length} image{exam.images.length !== 1 ? "s" : ""}</span>
                      </div>
                      {exam.description && (
                        <p className="text-xs text-gray-600 mt-1">{exam.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link href={`/radiologue/examens/${exam.examenID}`}>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 