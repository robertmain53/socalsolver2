'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Label } from '@/components/ui/Label';
import { Input } from '@/components/ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { formatCurrency } from '@/utils/formatters';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

type SubscriptionType = 'monthly' | 'quarterly' | 'biannual' | 'annual';

const periodMultipliers: Record<SubscriptionType, number> = {
  monthly: 1,
  quarterly: 3,
  biannual: 6,
  annual: 12,
};

export default function CostoPalestraPiscina() {
  const [subscriptionType, setSubscriptionType] = useState<SubscriptionType>('monthly');
  const [baseCost, setBaseCost] = useState<string>('50');
  const [registrationFee, setRegistrationFee] = useState<string>('30');
  const [extraServicesCost, setExtraServicesCost] = useState<string>('10');
  const [duration, setDuration] = useState<string>('12');

  const [results, setResults] = useState<{
    totalCost: number;
    averageMonthlyCost: number;
    totalBaseCost: number;
    totalExtrasCost: number;
    totalRegistrationFee: number;
  } | null>(null);

  const handleCalculate = () => {
    const numBaseCost = parseFloat(baseCost) || 0;
    const numRegistrationFee = parseFloat(registrationFee) || 0;
    const numExtraServicesCost = parseFloat(extraServicesCost) || 0;
    const numDuration = parseInt(duration, 10) || 1;

    const monthsPerPeriod = periodMultipliers[subscriptionType];
    const numberOfPeriods = Math.ceil(numDuration / monthsPerPeriod);

    const totalBaseCost = numBaseCost * numberOfPeriods;
    const totalExtrasCost = numExtraServicesCost * numDuration;
    const totalCost = totalBaseCost + numRegistrationFee + totalExtrasCost;
    const averageMonthlyCost = totalCost / numDuration;

    setResults({
      totalCost,
      averageMonthlyCost,
      totalBaseCost,
      totalExtrasCost,
      totalRegistrationFee: numRegistrationFee,
    });
  };

  const chartData = useMemo(() => {
    if (!results) return [];
    return [
      { name: 'Costo Base', value: results.totalBaseCost },
      { name: 'Servizi Extra', value: results.totalExtrasCost },
      { name: 'Iscrizione', value: results.totalRegistrationFee },
    ];
  }, [results]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Calcolatore Costo Palestra/Piscina</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <Label htmlFor="subscriptionType">Tipo di Abbonamento</Label>
            <Select value={subscriptionType} onValueChange={(value: SubscriptionType) => setSubscriptionType(value)}>
              <SelectTrigger id="subscriptionType">
                <SelectValue placeholder="Seleziona tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Mensile</SelectItem>
                <SelectItem value="quarterly">Trimestrale</SelectItem>
                <SelectItem value: "biannual">Semestrale</SelectItem>
                <SelectItem value="annual">Annuale</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="baseCost">Costo per Periodo (€)</Label>
            <Input id="baseCost" type="number" value={baseCost} onChange={(e) => setBaseCost(e.target.value)} placeholder="Es. 50" />
          </div>
          <div>
            <Label htmlFor="registrationFee">Quota di Iscrizione una tantum (€)</Label>
            <Input id="registrationFee" type="number" value={registrationFee} onChange={(e) => setRegistrationFee(e.target.value)} placeholder="Es. 30" />
          </div>
          <div>
            <Label htmlFor="extraServicesCost">Costo Mensile Servizi Extra (€)</Label>
            <Input id="extraServicesCost" type="number" value={extraServicesCost} onChange={(e) => setExtraServicesCost(e.target.value)} placeholder="Es. 10" />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="duration">Durata Totale (mesi)</Label>
            <Input id="duration" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Es. 12" />
          </div>
        </div>

        <Button onClick={handleCalculate} className="w-full">
          Calcola Costo Totale
        </Button>

        <AnimatePresence>
          {results && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mt-8"
            >
              <Card className="bg-gray-50 dark:bg-gray-800">
                <CardHeader>
                  <CardTitle>Risultati del Calcolo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center mb-6">
                    <div className="p-4 bg-blue-100 dark:bg-blue-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Costo Totale</p>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{formatCurrency(results.totalCost, 'EUR')}</p>
                    </div>
                    <div className="p-4 bg-purple-100 dark:bg-purple-900 rounded-lg">
                      <p className="text-sm text-gray-600 dark:text-gray-300">Costo Medio Mensile</p>
                      <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{formatCurrency(results.averageMonthlyCost, 'EUR')}</p>
                    </div>
                  </div>

                  <h4 className="text-lg font-semibold mb-4 text-center">Ripartizione dei Costi</h4>
                  <div className="h-64 w-full">
                    <ResponsiveContainer>
                      <BarChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis
                          tickFormatter={(value) => formatCurrency(value as number, 'EUR', {
                            minimumFractionDigits: 0,
                            maximumFractionDigits: 0,
                          })}
                        />
                        <Tooltip
                          formatter={(value) => [formatCurrency(value as number, 'EUR'), 'Costo']}
                          cursor={{ fill: 'rgba(206, 212, 218, 0.3)' }}
                        />
                        <Legend />
                        <Bar dataKey="value" name="Costo Totale" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  <ul className="mt-6 space-y-2 text-sm">
                    <li className="flex justify-between">
                      <span>Costo base totale per {duration} mesi:</span>
                      <span className="font-medium">{formatCurrency(results.totalBaseCost, 'EUR')}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Costo totale servizi extra:</span>
                      <span className="font-medium">{formatCurrency(results.totalExtrasCost, 'EUR')}</span>
                    </li>
                    <li className="flex justify-between">
                      <span>Quota di iscrizione:</span>
                      <span className="font-medium">{formatCurrency(results.totalRegistrationFee, 'EUR')}</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}