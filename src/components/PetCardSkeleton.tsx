import { View } from "react-native";
import { Skeleton } from "./ui/Skeleton";

interface PetCardSkeletonProps {
  count?: number;
}

function SinglePetCardSkeleton() {
  return (
    <View className="bg-white rounded-2xl p-4 shadow-sm mb-4 border border-gray-100">
      <View className="flex-row items-center">
        {/* Avatar skeleton */}
        <Skeleton width={64} height={64} variant="rounded" className="mr-4" />

        {/* Info skeleton */}
        <View className="flex-1">
          {/* Name */}
          <Skeleton width={120} height={20} className="mb-2" />
          {/* Tags row */}
          <View className="flex-row items-center">
            <Skeleton
              width={60}
              height={20}
              variant="rounded"
              className="mr-2"
            />
            <Skeleton width={40} height={14} />
          </View>
        </View>

        {/* Weight skeleton */}
        <View className="items-end">
          <View className="flex-row items-center">
            <Skeleton width={50} height={24} className="mb-1" />
          </View>
          <Skeleton width={45} height={18} variant="rounded" />
        </View>
      </View>
    </View>
  );
}

export function PetCardSkeleton({ count = 3 }: PetCardSkeletonProps) {
  return (
    <View>
      {Array.from({ length: count }).map((_, index) => (
        <SinglePetCardSkeleton key={index} />
      ))}
    </View>
  );
}
