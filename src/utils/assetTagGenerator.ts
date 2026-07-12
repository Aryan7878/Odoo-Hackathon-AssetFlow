import { prisma } from '../config/database';
import { ASSET_TAG_PREFIX } from '../constants';

export async function generateAssetTag(): Promise<string> {
  const latestAsset = await prisma.asset.findFirst({
    where: {
      assetTag: { startsWith: ASSET_TAG_PREFIX + '-' },
    },
    orderBy: { assetTag: 'desc' },
    select: { assetTag: true },
  });

  if (!latestAsset) {
    return `${ASSET_TAG_PREFIX}-00001`;
  }

  const parts = latestAsset.assetTag.split('-');
  const lastNumber = parseInt(parts[1] || '0', 10);
  const nextNumber = lastNumber + 1;
  return `${ASSET_TAG_PREFIX}-${String(nextNumber).padStart(5, '0')}`;
}

export function formatAssetTag(number: number): string {
  return `${ASSET_TAG_PREFIX}-${String(number).padStart(5, '0')}`;
}
