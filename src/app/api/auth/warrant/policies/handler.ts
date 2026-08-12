import { NextRequest, NextResponse } from 'next/server';
import {
  warrantListPolicies,
  warrantCreatePolicy,
  warrantDeletePolicy,
  warrantSyncToAPI,
} from '@/lib/auth-providers';

export async function GET() {
  try {
    const policies = await warrantListPolicies();
    return NextResponse.json(policies);
  } catch (error) {
    console.error('Erreur lors de la récupération des politiques:', error);
    return NextResponse.json(
      { error: 'Impossible de récupérer la liste des politiques.' },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { policyType, policyKey, licenseTypes, description } = body;

    if (!policyType || !policyKey || !licenseTypes) {
      return NextResponse.json(
        { error: 'Les paramètres policyType, policyKey et licenseTypes sont requis.' },
        { status: 400 },
      );
    }

    const policy = await warrantCreatePolicy({
      policyType,
      policyKey,
      licenseTypes,
      description: description || null,
    });

    return NextResponse.json(policy);
  } catch (error) {
    console.error('Erreur lors de la création de la politique:', error);
    return NextResponse.json(
      { error: 'Impossible de créer ou mettre à jour la politique.' },
      { status: 500 },
    );
  }
}

export async function PUT() {
  try {
    const result = await warrantSyncToAPI();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de la synchronisation des politiques:', error);
    return NextResponse.json(
      { synced: false, errors: ['Impossible de synchroniser les politiques avec l\'API Warrant.'] },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { policyId } = body;

    if (!policyId) {
      return NextResponse.json(
        { error: 'Le paramètre policyId est requis.' },
        { status: 400 },
      );
    }

    const result = await warrantDeletePolicy(policyId);
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erreur lors de la suppression de la politique:', error);
    return NextResponse.json(
      { success: false, error: 'Impossible de supprimer la politique.' },
      { status: 500 },
    );
  }
}
