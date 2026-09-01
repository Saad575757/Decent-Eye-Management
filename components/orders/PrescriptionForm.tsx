"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export interface PrescriptionValues {
  rightSphere: string;
  rightCylinder: string;
  rightAxis: string;
  rightAdd: string;
  rightPD: string;
  leftSphere: string;
  leftCylinder: string;
  leftAxis: string;
  leftAdd: string;
  leftPD: string;
  notes: string;
}

const emptyPrescription: PrescriptionValues = {
  rightSphere: "",
  rightCylinder: "",
  rightAxis: "",
  rightAdd: "",
  rightPD: "",
  leftSphere: "",
  leftCylinder: "",
  leftAxis: "",
  leftAdd: "",
  leftPD: "",
  notes: "",
};

export function getEmptyPrescription(): PrescriptionValues {
  return { ...emptyPrescription };
}

const rows: { key: string; label: string }[] = [
  { key: "Sphere", label: "SPH" },
  { key: "Cylinder", label: "CYL" },
  { key: "Axis", label: "AXIS" },
  { key: "Add", label: "ADD" },
  { key: "PD", label: "PD" },
];

export function PrescriptionForm({
  values,
  onChange,
}: {
  values: PrescriptionValues;
  onChange: (v: PrescriptionValues) => void;
}) {
  function setField(field: keyof PrescriptionValues, value: string) {
    onChange({ ...values, [field]: value });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Eye Prescription</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Measurement</TableHead>
                <TableHead>Right Eye</TableHead>
                <TableHead>Left Eye</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row) => (
                <TableRow key={row.key}>
                  <TableCell className="font-medium">{row.label}</TableCell>
                  <TableCell>
                    <Input
                      placeholder="e.g. -1.50"
                      value={values[`right${row.key}` as keyof PrescriptionValues] as string}
                      onChange={(e) =>
                        setField(`right${row.key}` as keyof PrescriptionValues, e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="e.g. -1.25"
                      value={values[`left${row.key}` as keyof PrescriptionValues] as string}
                      onChange={(e) =>
                        setField(`left${row.key}` as keyof PrescriptionValues, e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="space-y-2">
          <Label htmlFor="rx-notes">Prescription Notes</Label>
          <Textarea
            id="rx-notes"
            value={values.notes}
            onChange={(e) => setField("notes", e.target.value)}
            placeholder="Any additional notes..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
