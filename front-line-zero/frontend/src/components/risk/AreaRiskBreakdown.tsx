import React from 'react';
import { Card, Metric, Flex, Text, ProgressBar, Divider, BadgeDelta } from '@tremor/react';
import useWebSocket from '../../hooks/useWebSocket';

interface AreaRiskProps {
  areaId: string;
}

const AreaRiskBreakdown: React.FC<AreaRiskProps> = ({ areaId }) => {
  const { risks } = useWebSocket();

  const areaRisk = risks.find((risk) => risk.areaId === areaId);

  if (!areaRisk) {
    return <Text>No risk data available for this area.</Text>;
  }

  const { name, riskLevel, trend, timestamp, requiresInspection } = areaRisk;

  // Determine the color based on the risk trend
  const trendColor = trend === 'increasing' ? 'red' : trend === 'decreasing' ? 'green' : 'gray';

  return (
    <Card>
      <Flex alignItems="start">
        <Text>{name}</Text>
        <Metric>{riskLevel}%</Metric>
        <BadgeDelta text={trend} color={trendColor} />
      </Flex>
      <ProgressBar percentageValue={riskLevel} color="red" marginTop="mt-2" />
      <Divider />
      <Flex justifyContent="justify-start">
        <Text>Last Updated:</Text>
        <Text>{new Date(timestamp).toLocaleString()}</Text>
      </Flex>
      {requiresInspection && (
        <Flex>
          <Text color="red">Inspection Required</Text>
        </Flex>
      )}
    </Card>
  );
};

export default AreaRiskBreakdown;