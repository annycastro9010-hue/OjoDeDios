import { sound } from '../audio/soundFX.js';

export class QuestSystem {
  constructor() {
    this.activeQuest = null;
  }

  generateQuestFor(npc, era = null) {
    if (era && era.id === 'biblical') {
      this.activeQuest = {
        title: "MILAGRO EN LA COSTA",
        description: "Camina con fe. Cosecha 2 raciones de grano o pescado y llévalas a la casona para alimentar a los hambrientos.",
        harvestGoal: 2,
        harvestCurrent: 0,
        deliverGoal: 2,
        deliverCurrent: 0,
        rewardCash: 200,
        completed: false
      };
    } else if (era && era.id === 'seventies') {
      this.activeQuest = {
        title: "VIBRA DE PAZ & AMOR",
        description: "Lleva 2 flores de hierba aromática al centro de la aldea y toca una melodía para disolver las tensiones.",
        harvestGoal: 2,
        harvestCurrent: 0,
        deliverGoal: 2,
        deliverCurrent: 0,
        rewardCash: 150,
        completed: false
      };
    } else if (era && era.id === 'forties') {
      this.activeQuest = {
        title: "SUMINISTROS DE RESISTENCIA",
        description: "Recolecta 2 paquetes de vendajes y provisiones para llevarlos al refugio subterráneo esquivando a las patrullas.",
        harvestGoal: 2,
        harvestCurrent: 0,
        deliverGoal: 2,
        deliverCurrent: 0,
        rewardCash: 250,
        completed: false
      };
    } else if (npc.type === 'cultivator' || npc.type === 'smuggler') {
      this.activeQuest = {
        title: "OPERACIÓN: COSECHA NOCTURNA",
        description: "Cosecha 2 fardos de hierba madura y llévalos a salvo al Almacén del Patrón. ¡Esquiva las linternas policiales!",
        harvestGoal: 2,
        harvestCurrent: 0,
        deliverGoal: 2,
        deliverCurrent: 0,
        rewardCash: 300,
        completed: false
      };
    } else if (npc.type === 'police' || npc.type === 'soldier') {
      this.activeQuest = {
        title: "PATRULLA DE CONTROL",
        description: "Estás dentro de la ley. Patrulla la zona y confisca cargamentos de 1 sospechoso para mantener el orden.",
        harvestGoal: 0,
        harvestCurrent: 0,
        deliverGoal: 1,
        deliverCurrent: 0,
        rewardCash: 100,
        completed: false
      };
    } else {
      this.activeQuest = {
        title: "EL ENCARGO DEL PATRÓN",
        description: "Supervisa los negocios. Entrega 1 cargamento en el muelle clandestino.",
        harvestGoal: 0,
        harvestCurrent: 0,
        deliverGoal: 1,
        deliverCurrent: 0,
        rewardCash: 500,
        completed: false
      };
    }
    return this.activeQuest;
  }

  onAction(actionType, amount = 1) {
    if (!this.activeQuest || this.activeQuest.completed) return false;

    if (actionType === 'harvest') {
      this.activeQuest.harvestCurrent = Math.min(
        this.activeQuest.harvestGoal,
        this.activeQuest.harvestCurrent + amount
      );
    } else if (actionType === 'deliver') {
      this.activeQuest.deliverCurrent = Math.min(
        this.activeQuest.deliverGoal,
        this.activeQuest.deliverCurrent + amount
      );
    }

    // Comprobar si se completó
    const isHarvestDone = this.activeQuest.harvestCurrent >= this.activeQuest.harvestGoal;
    const isDeliverDone = this.activeQuest.deliverCurrent >= this.activeQuest.deliverGoal;

    if (isHarvestDone && isDeliverDone) {
      this.activeQuest.completed = true;
      sound.playAscend();
      return true;
    }
    return false;
  }

  clear() {
    this.activeQuest = null;
  }
}
