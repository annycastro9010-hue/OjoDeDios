import { sound } from '../audio/soundFX.js';

export class QuestSystem {
  constructor() {
    this.activeQuest = null;
  }

  generateQuestFor(npc) {
    if (npc.type === 'cultivator') {
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
    } else if (npc.type === 'police') {
      this.activeQuest = {
        title: "PATRULLA DE CONTROL",
        description: "Estás dentro de la ley. Patrulla la isla y confisca cargamentos ilegales de 1 sospechoso para purificar la zona.",
        harvestGoal: 0,
        harvestCurrent: 0,
        deliverGoal: 1,
        deliverCurrent: 0,
        rewardCash: 100,
        completed: false
      };
    } else {
      this.activeQuest = {
        title: "EL OJO DEL PATRÓN",
        description: "Supervisa la hacienda. Visita el Muelle de Salida para comprobar las rutas de escape.",
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
