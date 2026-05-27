import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { RoadmapStep } from '../context/types';
import BranchCard from './BranchCard';

interface StepCardProps {
  step: RoadmapStep;
  stepNumber: number;
  onMarkDone: () => void;
}

export default function StepCard({ step, stepNumber, onMarkDone }: StepCardProps) {
  return (
    <View className="bg-white border border-gray-200 rounded-lg mx-6 mb-3 p-4">
      {/* Top Row */}
      <View className="flex-row items-center">
        <View className="w-7 h-7 bg-gray-900 rounded-full items-center justify-center">
          <Text className="text-white text-xs font-bold">{stepNumber}</Text>
        </View>
        <Text className="text-base font-semibold text-gray-900 ml-3 flex-1">
          {step.document.label}
        </Text>
      </View>

      {/* Fees & Typical Days Info */}
      <View className="mt-1 ml-10">
        <Text className="text-xs text-gray-500">
          Fee: {step.document.fees}
        </Text>
        <Text className="text-xs text-gray-500 mt-0.5">
          Process Time: {step.document.typicalDays}
        </Text>
      </View>

      {/* Nearest Branch Card */}
      <View className="ml-10">
        <BranchCard branch={step.nearestBranch} agencyType={step.document.agency} />
      </View>

      {/* Mark As Done Button */}
      <TouchableOpacity
        activeOpacity={step.isDone ? 1 : 0.7}
        onPress={step.isDone ? undefined : onMarkDone}
        disabled={step.isDone}
        className={`mt-4 rounded-lg py-3 items-center ${
          step.isDone ? 'bg-green-600' : 'bg-blue-600'
        }`}
      >
        <Text className="text-white text-sm font-semibold">
          {step.isDone ? 'Done' : 'Mark as Done'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
