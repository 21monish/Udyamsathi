import math
from typing import List
from app.schemas.calculator import EMIInput, EMIResponse, AmortizationEntry


def calculate_emi(data: EMIInput) -> EMIResponse:
    """
    Computes EMI and generates full month-by-month amortization schedule.
    Supports moratorium period handling.
    """
    p = data.principal
    annual_rate = data.annual_interest_rate
    total_tenure = data.tenure_months
    moratorium = min(data.moratorium_months or 0, total_tenure - 1)
    repayment_months = total_tenure - moratorium

    if repayment_months <= 0:
        repayment_months = total_tenure

    r = (annual_rate / 12.0) / 100.0

    # Calculate EMI
    if annual_rate == 0 or r == 0:
        emi = p / repayment_months
    else:
        emi = (p * r * math.pow(1 + r, repayment_months)) / (math.pow(1 + r, repayment_months) - 1)

    schedule: List[AmortizationEntry] = []
    balance = p
    total_interest = 0.0

    # Handle Moratorium months if any
    for month in range(1, moratorium + 1):
        interest_charge = balance * r
        total_interest += interest_charge
        schedule.append(
            AmortizationEntry(
                month=month,
                emi=round(interest_charge, 2),
                principal=0.0,
                interest=round(interest_charge, 2),
                balance=round(balance, 2),
            )
        )

    # Standard Amortization
    for month in range(moratorium + 1, total_tenure + 1):
        if annual_rate == 0 or r == 0:
            interest_charge = 0.0
            principal_paid = emi
        else:
            interest_charge = balance * r
            principal_paid = emi - interest_charge

        if month == total_tenure:
            # Settle final balance discrepancy
            principal_paid = balance
            emi = principal_paid + interest_charge

        total_interest += interest_charge
        balance = max(0.0, balance - principal_paid)

        schedule.append(
            AmortizationEntry(
                month=month,
                emi=round(emi, 2),
                principal=round(principal_paid, 2),
                interest=round(interest_charge, 2),
                balance=round(balance, 2),
            )
        )

    total_payment = p + total_interest

    return EMIResponse(
        emi=round(emi, 2),
        total_interest=round(total_interest, 2),
        total_payment=round(total_payment, 2),
        effective_tenure=repayment_months,
        amortization_schedule=schedule,
    )
